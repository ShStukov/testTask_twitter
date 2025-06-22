import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CommentService } from "./comment.service";
import { PostService } from "./post.service";
import { UserService } from "./user.service";
import { PostWithDetails } from "../models/post-with-details.models";
import { Post } from "../models/post.model";
import { User } from "../models/user.model";
import { CommentUser } from "../models/comment.model";

@Injectable({
  providedIn: 'root'
})

export class PostDetailsService {
  constructor(
    private postService: PostService,
    private userService: UserService,
    private commentService: CommentService
  ) { }

  getPostsWithDetailsByUserId(userId: number): Observable<PostWithDetails[]> {
    return forkJoin([
      this.postService.getPostsByUserId(userId),
      this.userService.getUserById(userId),
      this.commentService.getComments()
    ]).pipe(
      map(([posts, user, comments]) => {
        const userName = user ? user.name : 'Unknown user';
        const commentsCountMap = this.buildCommentCountMap(comments);

        return posts.map(post => ({
          ...post,
          authorName: userName,
          commentCount: commentsCountMap.get(post.id) || 0
        }));
      })
    );
  }

  getPostsWithDetailsByIds(postIds: number[]): Observable<PostWithDetails[]> {
    const postRequests = postIds.map(id => this.postService.getPostById(id));
    return forkJoin([
      ...postRequests,
      this.userService.getUsers(),
      this.commentService.getComments()
    ]).pipe(
      map(results => {
        const allUsers: User[] = results[results.length - 2] as User[];
        const allComments: CommentUser[] = results[results.length - 1] as CommentUser[];
        const posts: (Post | undefined)[] = results.slice(0, results.length - 2) as Post[];

        const userMap = new Map<number, string>(allUsers.map(user => [user.id, user.name]));
        const commentsCountMap = this.buildCommentCountMap(allComments);

        return posts.filter(Boolean).map(post => ({
          ...post!,
          authorName: userMap.get(post!.userId) || 'Unknown author',
          commentCount: commentsCountMap.get(post!.id) || 0
        }));
      })
    );
  }

  private buildCommentCountMap(comments: CommentUser[]): Map<number, number> {
    const map = new Map<number, number>();
    comments.forEach(comment => {
      map.set(comment.postId, (map.get(comment.postId) || 0) + 1);
    });
    return map;
  }
}
