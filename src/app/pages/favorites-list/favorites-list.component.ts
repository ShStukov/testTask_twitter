import { Component } from '@angular/core';
import { PostWithDetails } from '../../data/models/post-with-details.models';
import { Router, RouterModule } from '@angular/router';
import { FavoritesService } from '../../data/services/favorites.service';
import { catchError, of, finalize, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../user-posts/post-card/post-card.component';
import { PostDetailsService } from '../../data/services/post-details.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private favoritesService: FavoritesService,
    private postDetailsService: PostDetailsService
  ) { }

  ngOnInit(): void {
    this.favoritesService.favoritePostIds$
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(() => this.loadFavoritePosts());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        console.error('Error loading favorites posts:', err);
        this.error = 'Failed to load favorites posts.';
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(posts => this.favoritePosts = posts);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
