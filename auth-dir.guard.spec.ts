import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { getAuthGuardWithDummyUrl, runAuthGuardWithContext } from '../data/mocks/guards';

describe('AuthDirGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let routeStateMock: any = { snapshot: {}, url: "/login" };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        provideRouter([]),
      ]
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  it('should navigate to home if token is present', fakeAsync(async () => {
    localStorage.setItem('token', 'valid-token');
    router.createUrlTree.and.returnValue(routeStateMock);
    const result = await runAuthGuardWithContext(getAuthGuardWithDummyUrl('http://localhost:4200/login'));

    expect(result).toBe(routeStateMock);
    expect(router.createUrlTree).toHaveBeenCalledWith(['']);
  }));

  it('should allow access if token is not present', fakeAsync(async() => {
    localStorage.removeItem('token');

    const result = await runAuthGuardWithContext(getAuthGuardWithDummyUrl('http://localhost:4200/login'));
    expect(result).toBeTruthy()
    expect(router.createUrlTree).not.toHaveBeenCalled();
  }));

});
