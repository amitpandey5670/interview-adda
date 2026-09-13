import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import type { StageGroup, TopicSummary } from '@content-models';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';

interface NavModule {
  id: string;
  slug: string;
  title: string;
  order: number;
  stage: string;
  topics: TopicSummary[];
}

interface NavStage extends StageGroup {
  modules: NavModule[];
}

@Component({
  selector: 'app-index-nav',
  imports: [RouterLink],
  templateUrl: './index-nav.html',
  styleUrl: './index-nav.scss',
})
export class IndexNav {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();

  protected readonly language = signal('csharp');
  protected readonly stages = signal<NavStage[]>([]);
  protected readonly openModules = signal<Set<string>>(new Set());

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentModuleSlug = computed(() => {
    const match = /\/modules\/([^/]+)/.exec(this.url());
    return match?.[1] ?? '';
  });

  constructor() {
    const language = this.route.snapshot.paramMap.get('language') ?? 'csharp';
    this.language.set(language);
    this.runForRender(() => this.load(language));
    this.route.paramMap.subscribe((params) => {
      const next = params.get('language') ?? 'csharp';
      if (next !== this.language()) {
        this.language.set(next);
        this.runForRender(() => this.load(next));
      }
    });
  }

  isModuleOpen(slug: string): boolean {
    return this.openModules().has(slug) || this.currentModuleSlug() === slug;
  }

  protected toggleModule(slug: string): void {
    this.openModules.update((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  private async load(language: string): Promise<void> {
    const index = await this.content.getIndex(language);
    const modules: NavModule[] = [];
    for (const moduleRef of index.modules) {
      const moduleDoc = await this.content.getModule(language, moduleRef.slug);
      modules.push({
        id: moduleRef.id,
        slug: moduleRef.slug,
        title: moduleRef.title,
        order: moduleRef.order,
        stage: moduleRef.stage,
        topics: moduleDoc.topics,
      });
    }
    const byId = new Map(modules.map((item) => [item.id, item]));
    this.stages.set(
      index.stages.map((stage) => ({
        ...stage,
        modules: stage.moduleIds.map((id) => byId.get(id)).filter((item): item is NavModule => !!item),
      })),
    );
  }
}
