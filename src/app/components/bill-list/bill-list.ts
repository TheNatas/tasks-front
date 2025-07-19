import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService } from '../../services/bill';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bill-list.html',
  styleUrls: ['./bill-list.css']
})
export class BillListComponent {
  private billService = inject(BillService);
  bills$ = this.billService.bills$;
  newDescription = '';
  newAmount = 0;
  newDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

  ngOnInit(): void {
    this.billService.loadAll().subscribe();
  }

  markAsPaid(id: number) {
    this.billService.markAsPaid(id).subscribe();
  }

  addBill() {
    if (!this.newDescription.trim()) return;

    this.billService.create(this.newDescription, this.newAmount, this.newDate).subscribe(() => {
      this.newDescription = ''; // clear input after creation
      this.newAmount = 0;
      this.newDate = new Date().toISOString().split('T')[0]; // reset to current date
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
