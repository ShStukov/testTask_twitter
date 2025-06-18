import { Component } from '@angular/core';
import { PostWithDetails } from '../../data/models/post-with-details.models';
import { Router, RouterModule } from '@angular/router';
import { CommentService } from '../../data/services/comment.service';
import { FavoritesService } from '../../data/services/favorites.service';
import { PostService } from '../../data/services/post.service';
import { UserService } from '../../data/services/user.service';
import { Observable, forkJoin, map, catchError, of, finalize, distinctUntilChanged } from 'rxjs';
import { CommentUser } from '../../data/models/comment.model';
import { Post } from '../../data/models/post.model';
import { User } from '../../data/models/user.model';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../user-posts/post-card/post-card.component';
import { PostDetailsService } from '../../data/services/post-details.service';

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
    private favoritesService: FavoritesService,
    private postDetailsService: PostDetailsService
  ) { }

  ngOnInit(): void {
    this.favoritesService.favoritePostIds$
      .pipe(distinctUntilChanged())
      .subscribe(() => this.loadFavoritePosts());
  }

  private loadFavoritePosts(): void {
    this.loading = true;
    this.error = null;

    const favoriteIds = this.favoritesService.getFavoritePostIds();
    if (favoriteIds.length === 0) {
      this.favoritePosts = [];
      this.loading = false;
      return;
    }

    this.postDetailsService.getPostsWithDetailsByIds(favoriteIds).pipe(
      catchError(err => {
        console.error('Ошибка загрузки избранных постов:', err);
        this.error = 'Не удалось загрузить избранные посты.';
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(posts => this.favoritePosts = posts);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
