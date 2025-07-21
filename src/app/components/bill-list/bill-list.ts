import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService, MonthlyBills, Bill } from '../../services/bill';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bill-list.html',
  styleUrls: ['./bill-list.css']
})
export class BillListComponent {
  private billService = inject(BillService);

  @ViewChild('taskForm') taskForm!: NgForm;

  monthlyBillsData: MonthlyBills[] = [];
  availableMonths: string[] = [];
  selectedMonth = '';
  currentMonthBills: Bill[] = [];
  currentMonthTotal = 0;
  paidBillsTotal = 0;
  pendingBillsTotal = 0;

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

      // Calculate paid and pending totals
      this.paidBillsTotal = this.currentMonthBills
        .filter(bill => bill.paid)
        .reduce((sum, bill) => sum + bill.amount, 0);

      this.pendingBillsTotal = this.currentMonthBills
        .filter(bill => !bill.paid)
        .reduce((sum, bill) => sum + bill.amount, 0);
    } else {
      this.currentMonthBills = [];
      this.currentMonthTotal = 0;
      this.paidBillsTotal = 0;
      this.pendingBillsTotal = 0;
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
      // Clear form fields
      this.newDescription = '';
      this.newAmount = 0;
      this.newDate = new Date().toISOString().split('T')[0];

      // Reset form validation state
      if (this.taskForm) {
        this.taskForm.resetForm({
          description: '',
          amount: 0,
          date: this.newDate
        });
      }

      this.showAddForm = false;
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
