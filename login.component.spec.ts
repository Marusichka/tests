import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import * as UserActions from '../../store/user/user.actions';
import { IAuthResponse } from "../../types/interfaces/post";

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let store: jasmine.SpyObj<Store>;
  const mockResponse: IAuthResponse = {
    code: '123',
    data: {
      displayName: 'test',
      email: 'test@test.test',
      firstName: 'test',
      id: 1,
      lastName: 'test',
      nicename: 'test',
      token: 'mock-token'
    },
    message: 'test',
    statusCode: 200,
    success: true
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, StoreModule.forRoot({})],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Store, useValue: storeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields and required validators', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('username')!.value).toBe('');
    expect(component.loginForm.get('password')!.value).toBe('');
    expect(component.loginForm.get('username')!.hasError('required')).toBeTrue();
    expect(component.loginForm.get('password')!.hasError('required')).toBeTrue();
  });

  it('should set submitted to true when login is called', () => {
    authService.login.and.returnValue(of(mockResponse));
    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.login();

    expect(component.submitted).toBeTrue();
  });

  it('should dispatch loadUser and navigate on successful login', () => {
    authService.login.and.returnValue(of(mockResponse));
    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.login();

    expect(authService.login).toHaveBeenCalledWith('testuser', 'password');
    expect(store.dispatch).toHaveBeenCalledWith(UserActions.loadUser());
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set errorMessage on failed login', () => {
    authService.login.and.returnValue(throwError(() => new Error('Login failed')));
    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.login();

    expect(authService.login).toHaveBeenCalledWith('testuser', 'password');
    expect(component.errorMessage).toBe('Login failed. Please try again.');
  });

  it('should have ng-invalid class and submit button is disabled', () => {
    component.loginForm.setValue({ username: '', password: '' });
    const usernameInput = fixture.debugElement.query(By.css('#username')).nativeElement;
    const passwordInput = fixture.debugElement.query(By.css('#password')).nativeElement;
    const submitInput = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(component.loginForm.get('username')!.value).toBe('');
    expect(component.loginForm.get('password')!.value).toBe('');
    expect(usernameInput).toHaveClass('ng-invalid');
    expect(passwordInput).toHaveClass('ng-invalid');
    expect(submitInput.disabled).toBeTruthy();
  });

  it('should show error if the field is required and form is submitted', () => {
    authService.login.and.returnValue(throwError(() => new Error('Login failed')));
    component.loginForm.setValue({ username: '', password: '' });
    component.login();

    expect(component.showError('username')).toBeTrue();
    expect(component.showError('password')).toBeTrue();
  });

});
