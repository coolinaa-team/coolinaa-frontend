import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    emailOrUsername: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    const { emailOrUsername, password } = this.form.value;
    this.loading = true;
    this.error = '';
    this.auth
      .login(emailOrUsername!, password!)
      .pipe(
        catchError(() => {
          this.error = 'Unable to sign in. Please check your credentials.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((res) => {
        if (res) {
          setTimeout(() => {
            const isAdmin = res.user?.role === 'admin';
            this.router.navigate([isAdmin ? '/admin' : '/feed']);
          }, 0);
        }
      });
  }
}
