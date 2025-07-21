import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService, MonthlyBills, Bill } from '../../services/bill';
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

  monthlyBillsData: MonthlyBills[] = [];
  availableMonths: string[] = [];
  selectedMonth = '';
  currentMonthBills: Bill[] = [];
  currentMonthTotal = 0;

  newDescription = '';
  newAmount = 0;
  newDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  showAddForm = false;

  ngOnInit(): void {
    this.generateCurrentYearMonths();
    this.loadMonthlyBills();
  }

  private generateCurrentYearMonths(): void {
    const currentYear = new Date().getFullYear();
    this.availableMonths = [];

    for (let month = 1; month <= 12; month++) {
      const monthString = `${currentYear}-${month.toString().padStart(2, '0')}`;
      this.availableMonths.push(monthString);
    }

    // Set current month as default
    this.selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  }

  loadMonthlyBills(): void {
    this.billService.getBillsByMonth().subscribe(data => {
      this.monthlyBillsData = data;
      this.updateCurrentMonthData();
    });
  }

  onMonthChange(): void {
    this.updateCurrentMonthData();
  }

  private updateCurrentMonthData(): void {
    const monthData = this.monthlyBillsData.find(item => item.month === this.selectedMonth);
    if (monthData) {
      this.currentMonthBills = monthData.bills;
      this.currentMonthTotal = monthData.totalAmount;
    } else {
      this.currentMonthBills = [];
      this.currentMonthTotal = 0;
    }
  }

  markAsPaid(id: number) {
    this.billService.markAsPaid(id).subscribe(() => {
      // Reload monthly data after marking as paid
      this.loadMonthlyBills();
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addBill() {
    if (!this.newDescription.trim()) return;

    this.billService.create(this.newDescription, this.newAmount, this.newDate).subscribe(() => {
      this.newDescription = ''; // clear input after creation
      this.newAmount = 0;
      this.newDate = new Date().toISOString().split('T')[0]; // reset to current date
      this.showAddForm = false; // hide form after successful submission
      // Reload monthly data after creating a new bill
      this.loadMonthlyBills();
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
