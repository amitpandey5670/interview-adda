import { Component, input } from '@angular/core';
import type { StepItem } from '@content-models';
import { CodeBlock } from '../code-block/code-block';

@Component({
  selector: 'app-steps-block',
  imports: [CodeBlock],
  templateUrl: './steps-block.html',
  styleUrl: './steps-block.scss',
})
export class StepsBlock {
  readonly title = input.required<string>();
  readonly items = input.required<StepItem[]>();
}
