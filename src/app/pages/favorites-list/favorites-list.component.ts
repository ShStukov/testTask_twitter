import { Component } from '@angular/core';
import { PostWithDetails } from '../../data/models/post-with-details.models';
import { Router, RouterModule } from '@angular/router';
import { CommentService } from '../../data/services/comment.service';
import { FavoritesService } from '../../data/services/favorites.service';
import { PostService } from '../../data/services/post.service';
import { UserService } from '../../data/services/user.service';
import { Observable, forkJoin, map, catchError, of, finalize } from 'rxjs';
import { CommentUser } from '../../data/models/comment.model';
import { Post } from '../../data/models/post.model';
import { User } from '../../data/models/user.model';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../user-posts/post-card/post-card.component';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PostCardComponent
  ],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.scss'
})
export class FavoritesListComponent {
  favoritePosts: PostWithDetails[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService,
    private favoritesService: FavoritesService
  ) { }

  ngOnInit(): void {
    this.loadFavoritePosts();

    // Подписываемся на изменения в избранном, чтобы обновлять список,
    // если пользователь добавит/удалит пост из избранного на этой же странице
    this.favoritesService.favoritePostIds$.subscribe(() => {
      // Простой способ обновить: перезапустить загрузку постов.
      // Для больших списков можно реализовать более сложную логику,
      // чтобы не перезагружать все посты, а только удалять/добавлять нужные.
      this.loadFavoritePosts();
    });
  }

  private loadFavoritePosts(): void {
    this.loading = true;
    this.error = null;

    const favoriteIds = this.favoritesService.getFavoritePostIds();

    if (favoriteIds.length === 0) {
      this.favoritePosts = [];
      this.loading = false;
      return; // Если избранных постов нет, сразу завершаем
    }

    // Для каждого ID избранного поста делаем запрос на его получение,
    // затем объединяем их и обогащаем данными об авторе и комментариях.
    const postRequests: Observable<Post>[] = favoriteIds.map(id => this.postService.getPostById(id));

    forkJoin([
      ...postRequests, // Динамически создаем массив Observable для forkJoin
      this.userService.getUsers(), // Все пользователи
      this.commentService.getComments() // Все комментарии
    ]).pipe(
      map(results => {
        // Последние два элемента в results - это users и comments
        const allUsers: User[] = results[results.length - 2] as User[];
        const allComments: CommentUser[] = results[results.length - 1] as CommentUser[];
        const posts: Post[] = results.slice(0, results.length - 2) as Post[]; // Извлекаем посты

        const userMap = new Map<number, string>(allUsers.map(user => [user.id, user.name]));
        const commentsCountMap = new Map<number, number>();

        allComments.forEach(comment => {
          commentsCountMap.set(comment.postId, (commentsCountMap.get(comment.postId) || 0) + 1);
        });

        // Обогащаем посты
        return posts.map(post => ({
          ...post,
          authorName: userMap.get(post.userId) || 'Неизвестный Автор',
          commentCount: commentsCountMap.get(post.id) || 0
        }));
      }),
      catchError(err => {
        console.error('Failed to load favorite posts:', err);
        this.error = 'Не удалось загрузить избранные посты. Попробуйте позже.';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(postsWithDetails => {
      this.favoritePosts = postsWithDetails;
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
