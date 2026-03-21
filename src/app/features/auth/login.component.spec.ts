import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule]
    })
      .overrideProvider(AuthService, { useValue: auth })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('disables submit when form is invalid', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('logs in and navigates on success', fakeAsync(() => {
    auth.login.and.returnValue(of({} as any));
    const navSpy = spyOn(router, 'navigate');

    component.form.setValue({ emailOrUsername: 'user', password: 'pass' });
    component.onSubmit();
    tick();

    expect(auth.login).toHaveBeenCalledWith('user', 'pass');
    expect(navSpy).toHaveBeenCalledWith(['/feed']);
  }));

  it('shows error on failure', fakeAsync(() => {
    auth.login.and.returnValue(throwError(() => new Error('fail')));
    component.form.setValue({ emailOrUsername: 'user', password: 'bad' });

    component.onSubmit();
    tick();

    expect(component.error).toContain('Unable');
  }));
});
