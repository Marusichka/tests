import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { PaginatorState } from 'primeng/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PostListComponent } from './post-list.component';
import { WordpressService } from '../../services/wordpress.service';
import { MessagesService } from '../../services/messages.service';
import { LanguageService } from '../../services/language.service';
import { messagesMode } from '../../types/enum/messagesMode';
import { Languages } from '../../types/enum/langMode';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let sanitizer: DomSanitizer;
  let fixture: ComponentFixture<PostListComponent>;
  let wordpressService: jasmine.SpyObj<WordpressService>;
  let languageService: jasmine.SpyObj<LanguageService>;
  let messagesService: jasmine.SpyObj<MessagesService>;
  const mockHeaders = new HttpHeaders({ 'Custom-Header': '2', 'X-Wp-Total': 2 });
  const mockPosts: any[] = [
    { id: 1,
      excerpt: {
        rendered: 'test'
      },
      title:
        {
          rendered: 'Test Post 1'
        },
      content: { rendered: 'Content 1' },
      mobileImage: '/test.jpg',
      second_featured_image: '/test.jpg',
      featured_image_url: '/wp-includes/images/media/default.svg'
    },
    { id: 2,
      excerpt: {
        rendered: 'test'
      },
      title:
        {
          rendered: 'Test Post 2'
        },
      content: { rendered: 'Content 2' },
      mobileImage: '/test.jpg',
      second_featured_image: '/test.jpg',
      featured_image_url: '/wp-includes/images/media/default.svg'
    }
  ];

  const mockMappedPosts: any[] = [
    {
      id: 1,
      title: 'Test Post 1',
      excerpt: 'test',
      mobileImage: '/test.jpg'
    },
    {
      id: 2,
      title: 'Test Post 2',
      excerpt: 'test',
      mobileImage: '/test.jpg'
    }
  ];

  beforeEach(async () => {
    wordpressService = jasmine.createSpyObj('WordpressService', ['getPosts', 'resetPaginationConfigs']);
    languageService = jasmine.createSpyObj('LanguageService', ['langCurrent$']);
    messagesService = jasmine.createSpyObj('MessagesService', ['addMessages']);

    wordpressService.getPosts.and.returnValue(
      of(
        new HttpResponse({
          body: mockPosts,
          headers: mockHeaders,
        })
      )
    );

    languageService.langCurrent$ = new BehaviorSubject<Languages>(Languages.en);

    await TestBed.configureTestingModule({
      imports: [PostListComponent, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        HttpClient,
        { provide: WordpressService, useValue: wordpressService },
        { provide: LanguageService, useValue: languageService },
        { provide: MessagesService, useValue: messagesService },
        { provide: ActivatedRoute, useValue: { params: of({ page: 1 }) } }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchPosts on ngOnInit and subscribe to route params and language changes', () => {
    spyOn(component, 'fetchPosts').and.callThrough();
    component.ngOnInit();
    expect(component.fetchPosts).toHaveBeenCalled();
    expect(wordpressService.pageFromRouter).toBe(1);
  });

  it('should call fetchPosts when language changes', () => {
    spyOn(component, 'fetchPosts').and.callThrough();
    languageService.langCurrent$.next(Languages.ru);

    component.ngOnInit();
    expect(wordpressService.resetPaginationConfigs).toHaveBeenCalled();
    expect(component.fetchPosts).toHaveBeenCalled();
  });

  it('should handle posts data and update postsSignal', () => {
    component.fetchPosts();
    const actualPosts = component.postsSignal();

    expect(component.totalPosts).toBe('2');
    expect(actualPosts).toEqual(mockMappedPosts);
  });

  it('should handle error when fetchPosts fails', () => {
    wordpressService.getPosts.and.returnValue(throwError(() => new Error('error')));
    component.fetchPosts();

    expect(messagesService.addMessages).toHaveBeenCalledWith(messagesMode.ERROR, 'An error occurred while load posts');
    expect(component.loadingSignal()).toBeFalse();
  });

  it('should update pagination and fetch posts on handlePageEvent', () => {
    spyOn(component, 'fetchPosts');
    const paginatorState: PaginatorState = { page: 1, rows: 5 };
    component.handlePageEvent(paginatorState);
    expect(wordpressService.pageFromRouter).toBe(2);
    expect(wordpressService.postsPerPage).toBe(5);
    expect(component.fetchPosts).toHaveBeenCalled();
  });

  it('should sanitize HTML content', () => {
    const htmlContent = `<p style="color: red;">Test Content</p>`;
    const sanitizedContent: SafeHtml = component.sanitizeHtml(htmlContent);
    expect(sanitizedContent).toEqual(sanitizer.bypassSecurityTrustHtml(htmlContent));
  });

  it('should detect posts ready correctly', () => {
    expect(component.detectPostsReady()).toBeTrue();
    component.loadingSignal.update(() => true);
    expect(component.detectPostsReady()).toBeTrue();
  });
});
