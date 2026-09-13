import { Component, input } from '@angular/core';
import type { ContentSection } from '@content-models';
import { CodeBlock } from '../code-block/code-block';

@Component({
  selector: 'app-prose-section',
  imports: [CodeBlock],
  templateUrl: './prose-section.html',
  styleUrl: './prose-section.scss',
})
export class ProseSection {
  readonly section = input.required<ContentSection>();
}
