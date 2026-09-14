import { Component, input } from '@angular/core';
import type { GlossaryEntry } from '@content-models';

@Component({
  selector: 'app-glossary-block',
  templateUrl: './glossary-block.html',
  styleUrl: './glossary-block.scss',
})
export class GlossaryBlock {
  readonly title = input('Key terms');
  readonly entries = input.required<GlossaryEntry[]>();
}
