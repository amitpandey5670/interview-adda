import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { TopicLink } from '../../core/content/catalog.models';

@Component({
  selector: 'app-related-links',
  imports: [RouterLink],
  templateUrl: './related-links.html',
  styleUrl: './related-links.scss',
})
export class RelatedLinks {
  readonly links = input<TopicLink[]>([]);
}
