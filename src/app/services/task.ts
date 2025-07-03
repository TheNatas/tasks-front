import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id: number;
  description: string;
  done: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly API_URL = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL);
  }

  markAsDone(id: number): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${id}/done`, {});
  }

  create(description: string): Observable<Task> {
    return this.http.post<Task>(this.API_URL, { description });
  }
}
