import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { InterviewPage as InterviewDoc } from '@content-models';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';

@Component({
  selector: 'app-interview-page',
  templateUrl: './interview-page.html',
  styleUrl: './interview-page.scss',
})
export class InterviewPage {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();
  protected readonly page = signal<InterviewDoc | null>(null);

  constructor() {
    this.route.paramMap.subscribe(() => this.runForRender(() => this.load()));
  }

  private async load(): Promise<void> {
    const language = this.route.parent?.snapshot.paramMap.get('language') ?? 'csharp';
    const moduleSlug = this.route.snapshot.paramMap.get('moduleSlug') ?? '';
    this.page.set(await this.content.getInterview(language, moduleSlug));
  }
}
