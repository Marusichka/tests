import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { WordpressService } from '../../../services/wordpress.service';
import { MessagesService } from '../../../services/messages.service';
import { IAcfFields, IPost } from '../../../types/interfaces/post';
import { messagesMode } from '../../../types/enum/messagesMode';
import { DashboardComponent } from './dashboard.component';


const translateService = jasmine.createSpyObj<TranslateService>('translateService', ['instant', 'get']);
const translateServiceMock = {
  currentLang: 'en',
  onLangChange: new EventEmitter<LangChangeEvent>(),
  use: translateService.get,
  get: translateService.get.and.returnValue(of('')),
  onTranslationChange: new EventEmitter(),
  onDefaultLangChange: new EventEmitter(),
  setDefaultLang(lang: string) { }
};


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let wordpressService: jasmine.SpyObj<WordpressService>;
  let messagesService: jasmine.SpyObj<MessagesService>;

  const mockCountries = [
    { title: { rendered: 'Country 1' } },
    { title: { rendered: 'Country 2' } }
  ];

  const mockResponse = new HttpResponse({
    body: mockCountries,
    status: 200,
    statusText: 'OK'
  });

  const mockArtistsList: any[] = [
    {
      id: 1,
      categories: [43],
      acf: { like: 'true', country: 'USA', productivity: '100' },
      title: {
        rendered: 'title 1'
      }
    },
    {
      id: 2,
      categories: [43],
      acf: { like: 'false', country: 'France', productivity: '200' },
      title: {
        rendered: 'title 2'
      }
    },
  ];

  beforeEach(async () => {
    const wordpressServiceSpy = jasmine.createSpyObj('WordpressService', ['addArtistToFavourite', 'getCountry', 'getCountries']);
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', ['addMessages']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, DashboardComponent],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { snapshot: { data: { artistsList: mockArtistsList } } } },
        { provide: WordpressService, useValue: wordpressServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy },
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    wordpressService = TestBed.inject(WordpressService) as jasmine.SpyObj<WordpressService>;
    wordpressServiceSpy.getCountry.and.returnValue(of(mockArtistsList))
    wordpressServiceSpy.getCountries.and.returnValue(of(mockCountries))
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    fixture.detectChanges();
  });


  beforeEach(() => {
    wordpressService.getCountries.and.returnValue(of(mockResponse));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with the correct number of checkboxes', () => {
    expect(component.form).toBeDefined();
    expect(component.checkboxes.length).toBe(mockArtistsList.length);
    expect(component.checkboxes.at(0).value).toBeTrue();
    expect(component.checkboxes.at(1).value).toBeFalse();
  });

  it('should show dialog and set dialog state', () => {
    wordpressService.getCountry.and.returnValue(of(    {
      id: 1,
      categories: [43],
      acf: { like: 'true', country: 'USA', productivity: '100' },
      title: {
        rendered: 'title 1'
      }
    }));
    fixture.detectChanges();
    component.showDialog('USA');

    expect(component.visible).toBeTrue();
    expect((component as any).dialogState.value).toBeTrue();
  });

  it('should close dialog and reset dialog state', () => {
    component.closeDialog(false);
    expect(component.visible).toBeFalse();
    expect((component as any).dialogState.value).toBeFalse();
  });

  it('should add artist to favorite and display success message', () => {
    wordpressService.addArtistToFavourite.and.returnValue(of({} as IPost));
    const spyDisable = spyOn(component.form, 'disable').and.callThrough();
    const spyEnable = spyOn(component.form, 'enable').and.callThrough();
    component.addArtistToFavourite(1, new Event('click'), 0);

    expect(spyDisable).toHaveBeenCalled();
    expect(wordpressService.addArtistToFavourite).toHaveBeenCalledWith(1, jasmine.any(Object) as unknown as IAcfFields);
    expect(messagesService.addMessages).toHaveBeenCalledWith(messagesMode.SUCCESS, 'Artist is updated');
    expect(spyEnable).toHaveBeenCalled();
  });

  it('should display error message if adding artist to favorite fails', () => {
    wordpressService.addArtistToFavourite.and.returnValue(throwError(() => new Error('Error')));
    const spyDisable = spyOn(component.form, 'disable').and.callThrough();
    const spyEnable = spyOn(component.form, 'enable').and.callThrough();
    component.addArtistToFavourite(1, new Event('click'), 0);

    expect(spyDisable).toHaveBeenCalled();
    expect(messagesService.addMessages).toHaveBeenCalledWith(messagesMode.ERROR, 'Failed to update Artist');
    expect(spyEnable).toHaveBeenCalled();
  });

  it('should filter artists by country', () => {
    component.filterArtists('usa');
    expect(component.artistsList.length).toBe(1);
    expect(component.artistsList[0].acf.country).toBe('USA');
  });

  it('should return the correct value from isLiked', () => {
    expect(component.isLiked(0)).toBe('-fill');
    expect(component.isLiked(1)).toBe('');
  });
});
