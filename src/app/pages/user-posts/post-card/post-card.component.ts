import { Component, Input, OnInit } from '@angular/core';
import { PostWithDetails } from '../../../data/models/post-with-details.models';
import { map, Observable } from 'rxjs';
import { FavoritesService } from '../../../data/services/favorites.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss'
})
export class PostCardComponent {
  @Input() post!: PostWithDetails;

  isFavoritePost$!: Observable<boolean>;

  constructor(private favoritesService: FavoritesService) { }

  ngOnInit(): void {
    // Подписываемся на изменения в favoritePostIds$, чтобы реактивно обновлять isFavoritePost
    this.isFavoritePost$ = this.favoritesService.favoritePostIds$.pipe(
      // map превращает Observable<number[]> в Observable<boolean> для текущего поста
      map(ids => ids.includes(this.post.id))
    );
  }

  toggleFavorite(): void {
    if (this.favoritesService.isFavorite(this.post.id)) {
      this.favoritesService.removeFavorite(this.post.id);
    } else {
      this.favoritesService.addFavorite(this.post.id);
    }
  }
}
