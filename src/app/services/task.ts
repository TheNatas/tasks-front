import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Task {
  id: number;
  description: string;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAll() {
    return this.http.get<Task[]>('http://localhost:8080/api/tasks').pipe(
      tap(tasks => this.tasksSubject.next(tasks))
    );
  }

  markAsDone(id: number) {
    return this.http.put(`http://localhost:8080/api/tasks/${id}/done`, {}).pipe(
      tap(() => {
        // Re-fetch tasks after update
        this.loadAll().subscribe();
      })
    );
  }

  create(description: string) {
    const task = { description, done: false };
    return this.http.post<Task>('http://localhost:8080/api/tasks', task).pipe(
      tap(() => this.loadAll().subscribe()) // refresh after create
    );
  }
}
