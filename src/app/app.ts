import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BillListComponent } from './components/task-list/bill-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BillListComponent],
  template: '<app-bill-list/>',
  styleUrls: ['./app.css']
})
export class App {

}
