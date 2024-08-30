import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { 
  ActionsSubject,
  ReducerManager,
  ReducerManagerDispatcher,
  StateObservable,
  Store,
  StoreModule
 } from '@ngrx/store';
import { EffectsMetadata, getEffectsMetadata } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { hot, cold } from 'jasmine-marbles';
import { addUser, loadUser } from '../user/user.actions';
import { UserEffects } from './user.effect';
import { WordpressService } from '../../services/wordpress.service';


describe('UserEffects', () => {
  let actions$: Observable<any>;
  let effects: UserEffects;
  let metadata: EffectsMetadata<UserEffects>;
  let wordpressService: jasmine.SpyObj<WordpressService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({})
      ],
      providers: [
        UserEffects,
        ActionsSubject,
        HttpClient,
        ReducerManagerDispatcher,
        ReducerManager,
        StateObservable,
        HttpHandler,
        Store,
        HttpTestingController,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(UserEffects);
    metadata = getEffectsMetadata(effects);
    wordpressService = TestBed.inject(WordpressService) as jasmine.SpyObj<WordpressService>;
  });


  it('should not dispatch', () => {
    expect((metadata.loadUser$ as {dispatch: boolean, useEffectsErrorHandler: boolean}).dispatch).toEqual(false);
  });

  it('should handle loadUser action and dispatch addUser action on success', () => {
    localStorage.setItem('token', JSON.stringify('12345'));
    const userResponse: any = {user :  { name: 'Test User', description: 'A test user' }, type: '[User] Add user'};
    spyOn(wordpressService, 'getUser');
    wordpressService.getUser.and.returnValue(of(userResponse));
    actions$ = hot('(a|)', { a: loadUser() });
    const expected = cold('(b|)', { b: addUser({user :  { name: 'Test User', description: 'A test user' }}) });

    expect(effects.loadUser$).toBeObservable(expected);
  });

  it('should handle loadUser action and return the action when no token is available', () => {
    localStorage.removeItem('token');
    actions$ = hot('(a|)', { a: loadUser() });

    effects.loadUser$.subscribe(result => {
      expect(result).toEqual(loadUser());
    });
  });

});
