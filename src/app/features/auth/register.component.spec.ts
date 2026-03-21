import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule]
    })
      .overrideProvider(AuthService, { useValue: auth })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('disables submit when form is invalid', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('registers and navigates on success', fakeAsync(() => {
    auth.register.and.returnValue(of({} as any));
    const navSpy = spyOn(router, 'navigate');

    component.form.setValue({ username: 'chef', email: 'chef@example.com', password: 'pass' });
    component.onSubmit();
    tick();

    expect(auth.register).toHaveBeenCalledWith('chef', 'chef@example.com', 'pass');
    expect(navSpy).toHaveBeenCalledWith(['/feed']);
  }));

  it('shows error on failure', fakeAsync(() => {
    auth.register.and.returnValue(throwError(() => new Error('fail')));
    component.form.setValue({ username: 'chef', email: 'chef@example.com', password: 'bad' });

    component.onSubmit();
    tick();

    expect(component.error).toContain('Unable');
  }));
});
