// login.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth'; // We’ll create this next
import { Router } from '@angular/router';
import { UserService } from '../../services/user';

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
  userService = inject(UserService);
  router = inject(Router);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  error: string | null = null;
  successMessage: string | null = null;
  activeTab: 'login' | 'signup' = 'login';

  login() {
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/']), // or dashboard route
      error: () => this.error = 'Invalid credentials',
    });
  }

  register() {
    const { username, password } = this.form.value;
    this.error = null;
    this.successMessage = null;

    this.userService.register(username!, password!).subscribe({
      next: () => {
        this.successMessage = 'Account created successfully! You can now log in.';
        this.form.reset();
        this.switchTab('login');
      },
      error: () => this.error = 'Registration failed. Username might already exist.',
    });
  }

  switchTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    this.error = null;
    this.form.reset();
  }

  closeSuccessMessage() {
    this.successMessage = null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}
