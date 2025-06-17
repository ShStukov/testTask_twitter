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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      map(params => Number(params.get('userId'))),
      switchMap(userId => {
        if (isNaN(userId)) {
          this.loading = false;
          this.userName = 'Неизвестный пользователь';
          return of([]);
        }

        this.userId = userId;
        this.loading = true;

        return forkJoin([
          this.userService.getUserById(userId),
          this.postService.getPostsByUserId(userId)
        ]).pipe(
          switchMap(([user, posts]) => {
            if (!user) {
              this.userName = 'Неизвестный пользователь';
              return of([]);
            }
            this.userName = user.name;

            if (posts.length === 0) {
              return of([]);
            }

            const commentsObservables = posts.map(post =>
              this.commentService.getCommentsByPostId(post.id).pipe(
                catchError(err => {
                  console.error(`Error loading comments for post ${post.id}:`, err);
                  return of([]);
                })
              )
            );

            return forkJoin(commentsObservables).pipe(
              map(commentsArrays => {
                const allComments = commentsArrays.flat();

                const commentsCountMap = new Map<number, number>();
                allComments.forEach(comment => {
                  commentsCountMap.set(comment.postId, (commentsCountMap.get(comment.postId) || 0) + 1);
                });

                return posts.map(post => ({
                  ...post,
                  authorName: this.userName,
                  commentCount: commentsCountMap.get(post.id) || 0
                }));
              })
            );
          }),
          catchError(err => {
            console.error('Failed to load user posts and details:', err);
            this.userName = 'Ошибка загрузки';
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
