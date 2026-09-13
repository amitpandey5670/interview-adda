import { Component, computed, input } from '@angular/core';
import type { Mindmap, MindmapNode } from '@content-models';

interface LaidOutNode extends MindmapNode {
  x: number;
  y: number;
  depth: number;
}

@Component({
  selector: 'app-mindmap-canvas',
  templateUrl: './mindmap-canvas.html',
  styleUrl: './mindmap-canvas.scss',
})
export class MindmapCanvas {
  readonly mindmap = input.required<Mindmap>();

  protected readonly layout = computed(() => {
    const data = this.mindmap();
    const children = new Map<string, MindmapNode[]>();
    for (const node of data.nodes) {
      const key = node.parentId ?? '__root__';
      const list = children.get(key) ?? [];
      list.push(node);
      children.set(key, list);
    }
    const laid: LaidOutNode[] = [];
    let y = 0;
    const walk = (node: MindmapNode, depth: number): void => {
      laid.push({ ...node, x: 24 + depth * 160, y: 28 + y * 56, depth });
      y += 1;
      for (const child of children.get(node.id) ?? []) {
        walk(child, depth + 1);
      }
    };
    const roots = data.nodes.filter((node) => !node.parentId);
    for (const root of roots.length ? roots : data.nodes.slice(0, 1)) {
      walk(root, 0);
    }
    const byId = new Map(laid.map((node) => [node.id, node]));
    const edges = data.edges
      .map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) {
          return null;
        }
        return { ...edge, from, to };
      })
      .filter((edge) => !!edge);
    const width = Math.max(640, ...laid.map((node) => node.x + 180));
    const height = Math.max(240, y * 56 + 40);
    return { nodes: laid, edges, width, height };
  });
}
