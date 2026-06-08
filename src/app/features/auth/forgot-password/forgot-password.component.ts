import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { TuiButton, TuiError, TuiInput, TuiLink } from '@taiga-ui/core';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, TuiInput, TuiError, TuiButton, TuiLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = false;
  error = '';
  sent = false;

  onSubmit() {
    if (this.form.invalid || this.loading) return;

    const email = this.form.value.email!;
    this.loading = true;
    this.error = '';
    this.sent = false;

    this.auth
      .forgotPassword(email)
      .pipe(
        tap(() => {
          this.sent = true;
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email },
          });
        }),
        catchError((err) => {
          this.error = this.errorService.extractErrorMessage(err);
          return EMPTY;
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe();
  }
}
