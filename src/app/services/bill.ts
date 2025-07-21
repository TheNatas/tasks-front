import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Bill {
  id: number;
  description: string;
  paid: boolean;
  amount: number;
  date: string;
}

export interface MonthlyBills {
  month: string;
  totalAmount: number;
  bills: Bill[];
}

@Injectable({ providedIn: 'root' })
export class BillService {
  private billsSubject = new BehaviorSubject<Bill[]>([]);
  bills$ = this.billsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAll() {
    return this.http.get<Bill[]>(`${environment.apiUrl}/bills`).pipe(
      tap(bills => this.billsSubject.next(bills))
    );
  }

  getBillsByMonth() {
    return this.http.get<MonthlyBills[]>(`${environment.apiUrl}/bills/grouped-by-month`);
  }

  markAsPaid(id: number) {
    return this.http.put(`${environment.apiUrl}/bills/${id}/paid`, {}).pipe(
      tap(() => {
        // Re-fetch bills after update
        this.loadAll().subscribe();
      })
    );
  }

  create(description: string, amount: number, date: string) {
    const bill = { description, amount, date, paid: false };
    return this.http.post<Bill>(`${environment.apiUrl}/bills`, bill).pipe(
      tap(() => this.loadAll().subscribe()) // refresh after create
    );
  }
}
