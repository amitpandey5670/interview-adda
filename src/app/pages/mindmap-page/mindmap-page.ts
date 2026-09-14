import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Mindmap } from '@content-models';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';
import { ConceptCards } from '../../shared/concept-cards/concept-cards';
import { MermaidDiagramComponent } from '../../shared/mermaid-diagram/mermaid-diagram';
import { MindmapCanvas } from '../../shared/mindmap-canvas/mindmap-canvas';

@Component({
  selector: 'app-mindmap-page',
  imports: [ConceptCards, MermaidDiagramComponent, MindmapCanvas],
  templateUrl: './mindmap-page.html',
  styleUrl: './mindmap-page.scss',
})
export class MindmapPage {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();
  protected readonly mindmap = signal<Mindmap | null>(null);

  constructor() {
    this.route.paramMap.subscribe(() => this.runForRender(() => this.load()));
  }

  protected language(): string {
    return this.route.parent?.snapshot.paramMap.get('language') ?? 'csharp';
  }

  protected moduleSlug(): string {
    return this.route.snapshot.paramMap.get('moduleSlug') ?? '';
  }

  private async load(): Promise<void> {
    this.mindmap.set(await this.content.getMindmap(this.language(), this.moduleSlug()));
  }
}
