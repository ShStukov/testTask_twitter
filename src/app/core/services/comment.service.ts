import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = "https://jsonplaceholder.typicode.com/comments"

  constructor(private http: HttpClient) { }

  getComments(): Observable<Comment[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error loading comments: ', error)
        return of([])
      })
    );
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?postId=${postId}`).pipe(
      catchError(error => {
        console.error('Error loading commentsByPostId: ', error)
        return of([])
      })
    );
  }

}
