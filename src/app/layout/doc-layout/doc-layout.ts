import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IndexNav } from '../index-nav/index-nav';
import { NavToggle } from '../nav-toggle/nav-toggle';

@Component({
  selector: 'app-doc-layout',
  imports: [RouterOutlet, IndexNav, NavToggle],
  templateUrl: './doc-layout.html',
  styleUrl: './doc-layout.scss',
})
export class DocLayout {
  private readonly router = inject(Router);
  protected readonly navOpen = signal(false);

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.navOpen.set(false);
    });
  }

  protected toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }
}
