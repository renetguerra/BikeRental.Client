import {
  Directive,
  Input,
  Renderer2,
  HostListener,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Directive({
  selector: '[appCalendarContextMenu]',
  standalone: true,
})
export class CalendarContextMenuDirective {
  @Input('appCalendarContextMenu') menuTrigger!: MatMenuTrigger | null;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.listen('document', 'contextmenu', (event: MouseEvent) => {
      event.preventDefault();
    });
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    if (!event) {
      console.error('El evento llegó como undefined');
      return;
    }

    const target = event.target as HTMLElement;

    const clickedOnCalendarCell = target.closest(
      '.mat-calendar-body-cell-container'
    );

    if (clickedOnCalendarCell) {
      event.preventDefault();

      this.menuTrigger?.openMenu();

      const menuElement = document.querySelector(
        '.mat-mdc-menu-panel'
      ) as HTMLElement;
      if (menuElement) {
        menuElement.style.display = 'block';
        menuElement.style.position = 'fixed';
        menuElement.style.left = `${event.clientX}px`;
        menuElement.style.top = `${event.clientY}px`;
      } else {
        console.error('El menú no se encontró en el DOM.');
      }
    }

    if (clickedOnCalendarCell == null && this.menuTrigger?.menuOpen) {
      this.menuTrigger?.closeMenu();
    }
  }

  @HostListener('click', ['$event'])
  onLeftClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedOnCalendarCell = target.closest(
      '.mat-calendar-body-cell-container'
    );
    const menuElement = document.querySelector(
      '.mat-mdc-menu-panel'
    ) as HTMLElement;

    if (clickedOnCalendarCell == null && this.menuTrigger?.menuOpen) {
      this.menuTrigger?.closeMenu();
      menuElement.style.display = 'none';
    }

    if (clickedOnCalendarCell && this.menuTrigger?.menuOpen) {
      event.preventDefault();

      if (menuElement) {
        menuElement.style.display = 'none';
      }
    }
  }
}
