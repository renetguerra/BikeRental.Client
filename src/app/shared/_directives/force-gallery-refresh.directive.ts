import {
    Directive,
    ElementRef,
    NgZone,
    OnInit,
    OnDestroy
  } from '@angular/core';
  
  @Directive({
    selector: '[appForceGalleryRefresh]',
    standalone: true
  })
  export class ForceGalleryRefreshDirective implements OnInit, OnDestroy {
    private resizeObserver!: ResizeObserver;
  
    constructor(private el: ElementRef, private zone: NgZone) {}
  
    ngOnInit(): void {
      this.zone.runOutsideAngular(() => {
        this.resizeObserver = new ResizeObserver(() => {
          window.dispatchEvent(new Event('resize'));
        });
        this.resizeObserver.observe(this.el.nativeElement);
      });
    }
  
    ngOnDestroy(): void {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }
  }
  