import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostCardComponent } from './post-card/post-card.component';
import { PostWithDetails } from '../../data/models/post-with-details.models';
import { PostService } from '../../data/services/post.service';
import { UserService } from '../../data/services/user.service';
import { CommentService } from '../../data/services/comment.service';
import { catchError, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-user-posts',
  standalone: true,
  imports: [
    RouterModule,
    PostCardComponent,
  ],
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.scss'
})
export class UserPostsComponent {
  userId: number = 0;
  userName: string = 'Загрузка...';
  posts: PostWithDetails[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('userId'))),
      tap(id => {
        if (isNaN(id)) {
          this.error = 'Некорректный ID пользователя.';
          this.loading = false;
          return;
        }
        this.userId = id;
        this.loading = true;
        this.error = null;
      }),
      switchMap(userId => {
        return forkJoin([
          this.postService.getPostsByUserId(userId),
          this.userService.getUsers(),
          this.commentService.getComments()
        ]).pipe(
          map(([posts, users, comments]) => {
            const userMap = new Map<number, string>(users.map(user => [user.id, user.name]));
            const commentsCountMap = new Map<number, number>();

            comments.forEach(comment => {
              commentsCountMap.set(comment.postId, (commentsCountMap.get(comment.postId) || 0) + 1);
            });

            const currentUser = users.find(u => u.id === userId);
            this.userName = currentUser ? currentUser.name : 'Неизвестный Пользователь';
            
            return posts.map(post => ({
              ...post,
              authorName: userMap.get(post.userId) || 'Неизвестный Автор',
              commentCount: commentsCountMap.get(post.id) || 0
            }));
          }),
          catchError(err => {
            console.error('Failed to load user posts and details:', err);
            this.error = 'Не удалось загрузить посты пользователя. Попробуйте позже.';
            return of([]);
          }),
          finalize(() => {
            this.loading = false;
          })
        );
      })
    ).subscribe({
      next: (postsWithDetails: PostWithDetails[]) => {
        this.posts = postsWithDetails;
      },
      error: (err) => {
        console.error('Subscription error in UserPostsComponent:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
