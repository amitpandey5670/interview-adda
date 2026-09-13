import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { injectRunForRender } from '../../core/content/run-for-render';
import type { Catalog, CatalogItem } from '../../core/content/catalog.models';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly content = inject(CONTENT_REPOSITORY);
  private readonly runForRender = injectRunForRender();
  protected readonly catalog = signal<Catalog | null>(null);
  protected readonly groups = computed(() => {
    const data = this.catalog();
    if (!data) {
      return [];
    }
    const byId = new Map(data.items.map((item) => [item.id, item]));
    return data.groups.map((group) => ({
      ...group,
      items: group.itemIds.map((id) => byId.get(id)).filter((item): item is CatalogItem => !!item),
    }));
  });

  constructor() {
    this.runForRender(async () => {
      this.catalog.set(await this.content.getCatalog());
    });
  }
}
