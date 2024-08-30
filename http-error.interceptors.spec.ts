import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { httpErrorInterceptor } from './http-error.interceptors';
import { MessagesService } from '../services/messages.service';
import { messagesMode } from '../types/enum/messagesMode';

describe('HttpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let messagesService: jasmine.SpyObj<MessagesService>;

  beforeEach(() => {
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['addMessages']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: MessagesService, useValue: messagesServiceSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that no requests are outstanding
  });

  it('should handle 401 error and call addMessages with Unauthorized message', () => {
    httpClient.get('http://localhost:4200/auth/dashboard').subscribe({
      next: () => fail('expected an error, not data'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(messagesService.addMessages).toHaveBeenCalledWith(messagesMode.ERROR, 'Unauthorized request 401. Please, login');
      },
    });

    const req = httpMock.expectOne('http://localhost:4200/auth/dashboard');
    req.flush('Unauthorized request', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle 403 error and call addMessages with Forbidden message', () => {
    httpClient.get('http://localhost:4200/auth/dashboard').subscribe({
      next: () => fail('expected an error, not data'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
        expect(messagesService.addMessages).toHaveBeenCalledWith(messagesMode.ERROR, 'Forbidden 403. Please, login');
      },
    });

    const req = httpMock.expectOne('http://localhost:4200/auth/dashboard');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });

  it('should handle other HTTP errors and call addMessages with HTTP error message', () => {
    httpClient.get('http://localhost:4200/auth/dashboard').subscribe({
      next: () => fail('expected an error, not data'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(messagesService.addMessages).toHaveBeenCalledWith(messagesMode.ERROR, 'HTTP error');
      },
    });

    const req = httpMock.expectOne('http://localhost:4200/auth/dashboard');
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
  });

});
