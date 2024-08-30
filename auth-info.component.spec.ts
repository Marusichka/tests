import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { authMode } from '../../../types/enum/authMode';
import { AuthInfoComponent } from './auth-info.component';
import { reducersUser } from '../../../store/user/user.reducers';


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

describe('AuthInfoComponent', () => {
  let component: AuthInfoComponent;
  let fixture: ComponentFixture<AuthInfoComponent>;

  beforeEach(async () => {
    const storeMock = jasmine.createSpyObj('Store', ['select']);
    storeMock.select.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('reducersUser', reducersUser),
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        AuthInfoComponent],
      providers: [
        provideMockStore({}),
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: Store, useValue: storeMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthInfoComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update isUserAvailable when user$ emits data', () => {
    component.user$.subscribe((data) => {
      if (data != null) {
        expect(component.isUserAvailable()).toBeTrue();
      } else {
        expect(component.isUserAvailable()).toBeFalse();
      }
    });
  });

  it('should emit login auth mode when emitAuthLinkClick is called and user is not available', () => {
    spyOn(component.authEvent, 'emit');
    component.isUserAvailable.update(() => false);

    component.emitAuthLinkClick();
    expect(component.authEvent.emit).toHaveBeenCalledWith(authMode.login);
  });

  it('should emit logout auth mode when emitAuthLinkClick is called and user is available', () => {
    spyOn(component.authEvent, 'emit');
    component.isUserAvailable.update(() => true);

    component.emitAuthLinkClick();
    expect(component.authEvent.emit).toHaveBeenCalledWith(authMode.logout);
  });

  it('should return loginTemplate when user is not available', () => {
    component.isUserAvailable.update(() => false);
    expect(component.getTemplate()).toBe(component.loginTemplate);
  });

  it('should return logoutTemplate when user is available', () => {
    component.isUserAvailable.update(() => true);
    expect(component.getTemplate()).toBe(component.logoutTemplate);
  });

  it('should emit closeMenuEvent when emitMenuClose is called', () => {
    spyOn(component.closeMenuEvent, 'emit');
    component.emitMenuClose();
    expect(component.closeMenuEvent.emit).toHaveBeenCalled();
  });

  it('should call emitAuthLinkClick when onMouseClick is triggered on authLink element', () => {
    spyOn(component, 'emitAuthLinkClick');

    const event = new Event('click');
    const targetElement = document.createElement('div');
    targetElement.id = component.idAuthLink;
    Object.defineProperty(event, 'target', { value: targetElement });

    component.onMouseClick(event);
    expect(component.emitAuthLinkClick).toHaveBeenCalled();
  });

  it('should not call emitAuthLinkClick when onMouseClick is triggered on a different element', () => {
    spyOn(component, 'emitAuthLinkClick');

    const event = new Event('click');
    const targetElement = document.createElement('div');
    targetElement.id = 'differentId';
    Object.defineProperty(event, 'target', { value: targetElement });

    component.onMouseClick(event);
    expect(component.emitAuthLinkClick).not.toHaveBeenCalled();
  });

});
