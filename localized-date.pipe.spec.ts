import { TestBed } from '@angular/core/testing';
import { LocalizedDatePipe } from './localized-date.pipe';
import { LanguageService } from '../services/language.service';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Languages } from '../types/enum/langMode';

describe('LocalizedDatePipe', () => {
  let pipe: LocalizedDatePipe;
  let languageService: LanguageService;

  beforeEach(() => {
    const languageServiceMock = {
      langCurrent$: new BehaviorSubject<string>('en-US')
    };

    TestBed.configureTestingModule({
      providers: [
        LocalizedDatePipe,
        { provide: LanguageService, useValue: languageServiceMock }
      ]
    });

    pipe = TestBed.inject(LocalizedDatePipe);
    languageService = TestBed.inject(LanguageService);
  });

  it('should format the date using the default pattern', () => {
    const date = '2024-08-09T12:34:56Z';
    const formattedDate = pipe.transform(date);
    expect(formattedDate).toBe(new DatePipe('en-US').transform(date, 'mediumDate'));
  });

  it('should format the date using a custom pattern', () => {
    const date = '2024-08-09T12:34:56Z';
    const pattern = 'yyyy-MM-dd';
    const formattedDate = pipe.transform(date, pattern);
    expect(formattedDate).toBe(new DatePipe('en-US').transform(date, pattern));
  });

  it('should use the locale from LanguageService', () => {
    const date = '2024-08-09T12:34:56Z';
    languageService.langCurrent$.next(Languages.uk);
    const formattedDate = pipe.transform(date);
    expect(formattedDate).toBe(new DatePipe(Languages.uk).transform(date, 'mediumDate'));
  });

  it('should throw an error for an invalid date format', () => {
    const invalidDate = '121-13-3';
    expect(() => {
      pipe.transform(invalidDate);
    }).toThrowError(Error, `NG02100: InvalidPipeArgument: 'Unable to convert "${invalidDate}" into a date' for pipe 'DatePipe'`);
  });

  it('should return null for an empty date', () => {
    const invalidDate = '';
    const formattedDate = pipe.transform(invalidDate);
    expect(formattedDate).toBeNull();
  });

});
