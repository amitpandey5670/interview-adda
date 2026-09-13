import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { OverviewPage as OverviewDoc } from '@content-models';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';
import { OfficialSources } from '../../shared/official-sources/official-sources';
import { ProseSection } from '../../shared/prose-section/prose-section';

@Component({
  selector: 'app-overview-page',
  imports: [ProseSection, OfficialSources],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
})
export class OverviewPage {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();
  protected readonly page = signal<OverviewDoc | null>(null);

  constructor() {
    const language = this.route.parent?.snapshot.paramMap.get('language') ?? 'csharp';
    this.runForRender(async () => {
      this.page.set(await this.content.getOverview(language));
    });
  }
}
