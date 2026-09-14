import { Component, input } from '@angular/core';
import type { ContentSection } from '@content-models';
import { CodeBlock } from '../code-block/code-block';
import { ContentBlocks } from '../content-blocks/content-blocks';

@Component({
  selector: 'app-prose-section',
  imports: [CodeBlock, ContentBlocks],
  templateUrl: './prose-section.html',
  styleUrl: './prose-section.scss',
})
export class ProseSection {
  readonly section = input.required<ContentSection>();
}
