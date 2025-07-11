import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',
})
export class TaskListComponent {
  private taskService = inject(TaskService);
  tasks$ = this.taskService.tasks$;
  newDescription = '';

  ngOnInit(): void {
    this.taskService.loadAll().subscribe();
  }

  markAsDone(id: number) {
    this.taskService.markAsDone(id).subscribe();
  }

  addTask() {
    if (!this.newDescription.trim()) return;

    this.taskService.create(this.newDescription).subscribe(() => {
      this.newDescription = ''; // clear input after creation
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
