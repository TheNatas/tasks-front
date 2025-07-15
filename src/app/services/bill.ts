import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Bill {
  id: number;
  description: string;
  paid: boolean;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class BillService {
  private billsSubject = new BehaviorSubject<Bill[]>([]);
  bills$ = this.billsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAll() {
    return this.http.get<Bill[]>('http://localhost:8080/api/bills').pipe(
      tap(bills => this.billsSubject.next(bills))
    );
  }

  markAsPaid(id: number) {
    return this.http.put(`http://localhost:8080/api/bills/${id}/paid`, {}).pipe(
      tap(() => {
        // Re-fetch bills after update
        this.loadAll().subscribe();
      })
    );
  }

  create(description: string, amount: number) {
    const bill = { description, amount, paid: false };
    return this.http.post<Bill>('http://localhost:8080/api/bills', bill).pipe(
      tap(() => this.loadAll().subscribe()) // refresh after create
    );
  }
}
