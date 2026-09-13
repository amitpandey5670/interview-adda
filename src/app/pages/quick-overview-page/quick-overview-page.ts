import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { QuickOverview } from '@content-models';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';

@Component({
  selector: 'app-quick-overview-page',
  templateUrl: './quick-overview-page.html',
  styleUrl: './quick-overview-page.scss',
})
export class QuickOverviewPage {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();
  protected readonly page = signal<QuickOverview | null>(null);

  constructor() {
    this.route.paramMap.subscribe(() => this.runForRender(() => this.load()));
  }

  private async load(): Promise<void> {
    const language = this.route.parent?.snapshot.paramMap.get('language') ?? 'csharp';
    const moduleSlug = this.route.snapshot.paramMap.get('moduleSlug') ?? '';
    this.page.set(await this.content.getQuickOverview(language, moduleSlug));
  }
}
