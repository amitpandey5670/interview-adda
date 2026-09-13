import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-nav-toggle',
  templateUrl: './nav-toggle.html',
  styleUrl: './nav-toggle.scss',
})
export class NavToggle {
  readonly open = input(false);
  readonly toggled = output<void>();
}
