import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.css'
})
export class LogoutButton {
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
