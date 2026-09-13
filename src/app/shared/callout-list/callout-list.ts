import { Component, input } from '@angular/core';

@Component({
  selector: 'app-callout-list',
  templateUrl: './callout-list.html',
  styleUrl: './callout-list.scss',
})
export class CalloutList {
  readonly title = input.required<string>();
  readonly items = input<string[]>([]);
}
