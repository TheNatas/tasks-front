import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TaskListComponent } from './components/task-list/task-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  template: '<app-task-list/>',
  styleUrls: ['./app.css']
})
export class App {

}
