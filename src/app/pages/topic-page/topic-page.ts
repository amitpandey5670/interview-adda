import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Topic } from '@content-models';
import type { TopicLink } from '../../core/content/catalog.models';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';
import { CalloutList } from '../../shared/callout-list/callout-list';
import { CorrelationList } from '../../shared/correlation-list/correlation-list';
import { OfficialSources } from '../../shared/official-sources/official-sources';
import { ProseSection } from '../../shared/prose-section/prose-section';
import { RelatedLinks } from '../../shared/related-links/related-links';

@Component({
  selector: 'app-topic-page',
  imports: [ProseSection, CalloutList, RelatedLinks, CorrelationList, OfficialSources],
  templateUrl: './topic-page.html',
  styleUrl: './topic-page.scss',
})
export class TopicPage {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();
  protected readonly topic = signal<Topic | null>(null);
  protected readonly related = signal<TopicLink[]>([]);

  constructor() {
    this.route.paramMap.subscribe(() => this.runForRender(() => this.load()));
  }

  private async load(): Promise<void> {
    const language = this.route.parent?.snapshot.paramMap.get('language') ?? 'csharp';
    const moduleSlug = this.route.snapshot.paramMap.get('moduleSlug') ?? '';
    const topicSlug = this.route.snapshot.paramMap.get('topicSlug') ?? '';
    const topic = await this.content.getTopic(language, moduleSlug, topicSlug);
    this.topic.set(topic);
    this.related.set(await this.content.resolveTopicLinks(language, topic.relatedTopicIds));
  }
}
