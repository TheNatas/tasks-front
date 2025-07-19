// login.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth'; // We’ll create this next
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', Validators.required],
  });

  error: string | null = null;

  login() {
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/']), // or dashboard route
      error: () => this.error = 'Invalid credentials',
    });
  }
}
