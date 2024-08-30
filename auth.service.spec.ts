import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import * as UserActions from '../store/user/user.actions';
import { IAuthResponse } from '../types/interfaces/post';
import { environment } from '../../environment/environment.dev';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;
  let store: jasmine.SpyObj<Store>;
  let router: jasmine.SpyObj<Router>;
  const initialState = {
    user: {
      name: 'Test User',
      description: 'Test Description'
    }
  };

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getToken', 'removeToken']);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'pipe', 'select']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        provideMockStore({ initialState }),
        { provide: TokenService, useValue: tokenServiceSpy },
        {
          provide: Store,
          useValue: storeSpy
        },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store the token', () => {
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
    const username = 'test';
    const password = 'password';

    service.login(username, password).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('mock-token');
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/jwt-auth/v1/token`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout and remove token', () => {
    service.logout();
    expect(tokenService.removeToken).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(UserActions.clearUser());
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

});
