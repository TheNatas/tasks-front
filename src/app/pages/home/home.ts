import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutButton } from '../../components/logout-button/logout-button';
import { BillListComponent } from '../../components/bill-list/bill-list';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LogoutButton, BillListComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
