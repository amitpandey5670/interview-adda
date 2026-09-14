import { Component, input } from '@angular/core';
import type { ContentBlock } from '@content-models';
import { CodeBlock } from '../code-block/code-block';
import { GlossaryBlock } from '../glossary-block/glossary-block';
import { MermaidDiagramComponent } from '../mermaid-diagram/mermaid-diagram';
import { StepsBlock } from '../steps-block/steps-block';

@Component({
  selector: 'app-content-blocks',
  imports: [CodeBlock, GlossaryBlock, MermaidDiagramComponent, StepsBlock],
  templateUrl: './content-blocks.html',
  styleUrl: './content-blocks.scss',
})
export class ContentBlocks {
  readonly blocks = input.required<ContentBlock[]>();
}
