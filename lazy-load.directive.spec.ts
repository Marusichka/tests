import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { LazyLoadDirective } from './lazy-load.directive';
import { Renderer2 } from '@angular/core';

@Component({
  template: `<img [appLazyLoad]="lazyImg" [fullImg]="fullImg" />`
})
class TestComponent {
  lazyImg = 'small-image.jpg';
  fullImg = 'large-image.jpg';
}

describe('LazyLoadDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let imgEl: HTMLImageElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [LazyLoadDirective],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [Renderer2],
    });

    fixture = TestBed.createComponent(TestComponent);
    imgEl = fixture.nativeElement.querySelector('img');

    spyOn(window as any, 'IntersectionObserver').and.callFake(function (this: IntersectionObserver, callback: IntersectionObserverCallback) {
      this.observe = () => {
        const entry: IntersectionObserverEntry[] = [
          {
            isIntersecting: true,
            target: imgEl,
            boundingClientRect: imgEl.getBoundingClientRect(),
            intersectionRatio: 1,
            intersectionRect: imgEl.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now(),
          }
        ];
        callback(entry, this);
      };

      this.disconnect = () => {};
    });

    fixture.detectChanges(); // Triggers the directive
  });

  it('should load the full image if window width is greater than 767px', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(800);
    expect(imgEl.getAttribute('src')).toBe('large-image.jpg');
  });

  it('should load the lazy image if window width is less than or equal to 767px', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(320);
    expect(imgEl.getAttribute('src')).toBe('small-image.jpg');
  });
});
