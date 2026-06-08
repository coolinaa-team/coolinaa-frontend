import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TuiButton, TuiError, TuiIcon, TuiInput, TuiLink } from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    repeatPassword: ['', [Validators.required]],
  });

  loading = false;
  error = '';
  success = false;

  onSubmit() {
    if (this.form.invalid || this.loading) return;

    const { code, newPassword, repeatPassword } = this.form.value;

    if (newPassword !== repeatPassword) {
      this.error = 'Пароли не совпадают';
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth
      .resetPassword(code!, newPassword!)
      .pipe(
        catchError((err) => {
          this.error = this.errorService.extractErrorMessage(err);
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((res) => {
        if (res === null) {
          return;
        }

        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1200);
      });
  }
}
