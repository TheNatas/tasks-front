import {
  Component,
  inject,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillService, Bill } from '../../services/bill';
import { FormsModule, NgForm } from '@angular/forms';
import {
  Observable,
  Subscription,
  combineLatest,
  map,
  BehaviorSubject,
} from 'rxjs';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bill-list.html',
  styleUrls: ['./bill-list.css'],
})
export class BillListComponent implements OnInit, OnDestroy {
  private billService = inject(BillService);
  private subscriptions = new Subscription();

  @ViewChild('taskForm') taskForm!: NgForm;

  billsGroupedByMonth$ = this.billService.billsGroupedByMonth$;

  availableMonths: string[] = [];
  selectedMonth = ''; // Used for ngModel only
  selectedMonth$ = new BehaviorSubject<string>(''); // Used for reactive logic

  newDescription = '';
  newAmount = 0;
  newDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  showAddForm = false;

  currentMonthBills$: Observable<Bill[]> = combineLatest([
    this.billsGroupedByMonth$,
    this.selectedMonth$,
  ]).pipe(
    map(([monthlyBills, selectedMonth]) => {
      return (
        monthlyBills.find((m) => m.month === selectedMonth)?.bills ?? []
      );
    })
  );

  currentMonthTotal$: Observable<number> = this.currentMonthBills$.pipe(
    map((bills) => bills.reduce((sum, b) => sum + b.amount, 0))
  );

  paidBillsTotal$: Observable<number> = this.currentMonthBills$.pipe(
    map((bills) =>
      bills
        .filter((b) => b.paid)
        .reduce((sum, b) => sum + b.amount, 0)
    )
  );

  pendingBillsTotal$: Observable<number> = this.currentMonthBills$.pipe(
    map((bills) =>
      bills
        .filter((b) => !b.paid)
        .reduce((sum, b) => sum + b.amount, 0)
    )
  );

  ngOnInit(): void {
    this.generateCurrentYearMonths();
    this.loadMonthlyBills();
  }

  private generateCurrentYearMonths(): void {
    const currentYear = new Date().getFullYear();
    this.availableMonths = [];

    for (let month = 1; month <= 12; month++) {
      const monthString = `${currentYear}-${month
        .toString()
        .padStart(2, '0')}`;
      this.availableMonths.push(monthString);
    }

    // Set current month as default
    this.selectedMonth = new Date().toISOString().slice(0, 7);
    this.selectedMonth$.next(this.selectedMonth);
  }

  onMonthChange(newMonth: string): void {
    this.selectedMonth = newMonth;
    this.selectedMonth$.next(newMonth);
  }

  loadMonthlyBills(): void {
    const sub = this.billService.getBillsByMonth().subscribe();
    this.subscriptions.add(sub);
  }

  markAsPaid(id: number) {
    const sub = this.billService.markAsPaid(id).subscribe(() => {
      this.loadMonthlyBills(); // refresh data
    });
    this.subscriptions.add(sub);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addBill() {
    if (!this.newDescription.trim()) return;

    this.billService
      .create(this.newDescription, this.newAmount, this.newDate)
      .subscribe(() => {
        this.newDescription = '';
        this.newAmount = 0;
        this.newDate = new Date().toISOString().split('T')[0];

        if (this.taskForm) {
          this.taskForm.resetForm({
            description: '',
            amount: 0,
            date: this.newDate,
          });
        }

        this.showAddForm = false;
        this.loadMonthlyBills();
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
