import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService, Task } from '../../services/task';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.html',
})
export class TaskListComponent {
  private taskService = inject(TaskService);

  tasks$ = new BehaviorSubject<Task[]>([]);

  constructor() {
    this.taskService.getAll().subscribe(tasks => this.tasks$.next(tasks));
  }

  markAsDone(id: number) {
    this.taskService.markAsDone(id).subscribe(() => {
      this.taskService.getAll().subscribe(tasks => this.tasks$.next(tasks));
    });
  }

  // Uglier approach: explicitly subscribe to getAll and manually trigger change detection
  /*
  tasks = [] as Task[];
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.taskService.getAll().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  markAsDone(id: number) {
    this.taskService.markAsDone(id).subscribe(() => {
      this.taskService.getAll().subscribe(tasks => {
        this.tasks = tasks;
        this.cdr.detectChanges(); // manually trigger view update
      });
    });
  }
  */
}
