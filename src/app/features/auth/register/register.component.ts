import { Component, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { TuiButton, TuiError, TuiIcon, TuiInput, TuiLink } from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TuiInput,
    TuiError,
    TuiButton,
    TuiIcon,
    TuiLink,
    TuiPassword,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    const { username, email, password } = this.form.value;
    this.loading = true;
    this.error = '';
    this.auth
      .register(username!, email!, password!)
      .pipe(
        catchError(() => {
          this.error = 'Unable to create account. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.router.navigate(['/feed']);
        }
      });
  }
}
