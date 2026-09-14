import { afterRenderEffect, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import type { MermaidDiagram } from '@content-models';

@Component({
  selector: 'app-mermaid-diagram',
  templateUrl: './mermaid-diagram.html',
  styleUrl: './mermaid-diagram.scss',
})
export class MermaidDiagramComponent {
  readonly diagram = input.required<MermaidDiagram>();
  private readonly host = viewChild<ElementRef<HTMLElement>>('host');
  protected readonly error = signal<string | null>(null);

  constructor() {
    afterRenderEffect(() => {
      void this.render(this.diagram());
    });
  }

  private async render(diagram: MermaidDiagram): Promise<void> {
    const el = this.host()?.nativeElement;
    if (!el) {
      return;
    }
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      });
      const { svg } = await mermaid.render(`mmd-${crypto.randomUUID()}`, diagram.source);
      el.innerHTML = svg;
      this.error.set(null);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Could not render diagram.');
    }
  }
}
