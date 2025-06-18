import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostCardComponent } from './post-card/post-card.component';
import { PostWithDetails } from '../../data/models/post-with-details.models';
import { PostService } from '../../data/services/post.service';
import { UserService } from '../../data/services/user.service';
import { CommentService } from '../../data/services/comment.service';
import { finalize, forkJoin, map, switchMap, tap } from 'rxjs';
import { PostDetailsService } from '../../data/services/post-details.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postDetailsService: PostDetailsService,
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('userId'))),
      tap(id => {
        if (isNaN(id)) {
          this.loading = false;
        } else {
          this.userId = id;
          this.loading = true;
        }
      }),
      switchMap(id => this.postDetailsService.getPostsWithDetailsByUserId(id).pipe(
        tap(posts => {
          if (posts.length > 0) {
            this.userName = posts[0].authorName;
          }
        }),
        finalize(() => this.loading = false)
      ))
    ).subscribe({
      next: posts => this.posts = posts,
      error: err => console.error('UserPostsComponent error:', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
