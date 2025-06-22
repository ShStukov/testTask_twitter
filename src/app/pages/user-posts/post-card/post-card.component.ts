import { Component, Input, OnInit } from '@angular/core';
import { PostWithDetails } from '../../../data/models/post-with-details.models';
import { map, Observable } from 'rxjs';
import { FavoritesService } from '../../../data/services/favorites.service';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../../data/services/comment.service';
import { CommentUser } from '../../../data/models/comment.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss'
})
export class PostCardComponent implements OnInit {
  @Input() post!: PostWithDetails;

  isFavoritePost$!: Observable<boolean>;
  showComments: boolean = false;
  comments: CommentUser[] = [];
  commentsLoaded: boolean = false;

  constructor(
    private favoritesService: FavoritesService,
    private commentService: CommentService
  ) { }

  ngOnInit() {
    this.isFavoritePost$ = this.favoritesService.favoritePostIds$.pipe(
      map(ids => ids.includes(this.post.id))
    );
  }

  toggleFavorite() {
    if (this.favoritesService.isFavorite(this.post.id)) {
      this.favoritesService.removeFavorite(this.post.id);
    } else {
      this.favoritesService.addFavorite(this.post.id);
    }
  }

  toggleComments() {
    this.showComments = !this.showComments;

    if (this.showComments && !this.commentsLoaded) {
      this.commentService.getCommentsByPostId(this.post.id).subscribe(
        comments => {
          this.comments = comments;
          this.commentsLoaded = true;
        }
      );
    }
  }
}