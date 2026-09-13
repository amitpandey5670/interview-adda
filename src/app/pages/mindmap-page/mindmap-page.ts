import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Mindmap } from '@content-models';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';
import { MindmapCanvas } from '../../shared/mindmap-canvas/mindmap-canvas';

@Component({
  selector: 'app-mindmap-page',
  imports: [MindmapCanvas],
  templateUrl: './mindmap-page.html',
})
export class MindmapPage {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();
  protected readonly mindmap = signal<Mindmap | null>(null);

  constructor() {
    this.route.paramMap.subscribe(() => this.runForRender(() => this.load()));
  }

  private async load(): Promise<void> {
    const language = this.route.parent?.snapshot.paramMap.get('language') ?? 'csharp';
    const moduleSlug = this.route.snapshot.paramMap.get('moduleSlug') ?? '';
    this.mindmap.set(await this.content.getMindmap(language, moduleSlug));
  }
}
