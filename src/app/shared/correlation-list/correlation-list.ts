import { Component, input } from '@angular/core';
import type { JsTsCorrelation } from '@content-models';

@Component({
  selector: 'app-correlation-list',
  templateUrl: './correlation-list.html',
  styleUrl: './correlation-list.scss',
})
export class CorrelationList {
  readonly items = input<JsTsCorrelation[]>([]);
}
