import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { CommentUser } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = "https://jsonplaceholder.typicode.com/comments"

  constructor(private http: HttpClient) { }

  getComments(): Observable<CommentUser[]> {
    return this.http.get<CommentUser[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error loading comments: ', error)
        return of([])
      })
    );
  }

  getCommentsByPostId(postId: number): Observable<CommentUser[]> {
    return this.http.get<CommentUser[]>(`${this.apiUrl}?postId=${postId}`).pipe(
      catchError(error => {
        console.error('Error loading commentsByPostId: ', error)
        return of([])
      })
    );
  }
}
