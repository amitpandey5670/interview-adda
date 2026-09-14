import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ConceptCard } from '@content-models';

@Component({
  selector: 'app-concept-cards',
  imports: [RouterLink],
  templateUrl: './concept-cards.html',
  styleUrl: './concept-cards.scss',
})
export class ConceptCards {
  readonly cards = input.required<ConceptCard[]>();
  readonly language = input('csharp');
  readonly moduleSlug = input('');
}
