import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = "https://jsonplaceholder.typicode.com/posts"

  constructor(private http: HttpClient) { }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error loading posts: ', error)
        return of([])
      })
    );
  }

  getPostsByUserId(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}?userId=${userId}`).pipe(
      catchError(error => {
        console.error('Error loading postByUserId: ', error)
        return of([])
      })
    );
  }

  getPostById(postId: number): Observable<Post | undefined> {
    return this.http.get<Post>(`<span class="math-inline">\{this\.apiUrl\}/</span>{postId}`).pipe(
      catchError(error => {
        console.error(`Error loading post by ID ${postId}:`, error);
        return of(undefined);
      })
    );
  }
}
