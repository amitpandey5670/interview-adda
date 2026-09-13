import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import type {
  ContentIndex,
  InterviewPage,
  Mindmap,
  ModuleDoc,
  OverviewPage,
  QuickOverview,
  Topic,
} from '@content-models';
import type { Catalog, TopicLink } from './catalog.models';
import type { ContentRepository } from './content-repository';

@Injectable({ providedIn: 'root' })
export class JsonContentRepository implements ContentRepository {
  private readonly http = inject(HttpClient);
  private readonly baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '/';
  private readonly cache = new Map<string, Promise<unknown>>();
  private readonly topicMaps = new Map<string, Promise<Map<string, TopicLink>>>();

  getCatalog(): Promise<Catalog> {
    return this.loadJson<Catalog>('catalog.json');
  }

  getIndex(language: string): Promise<ContentIndex> {
    return this.loadJson<ContentIndex>(`${language}/index.json`);
  }

  getOverview(language: string): Promise<OverviewPage> {
    return this.loadJson<OverviewPage>(`${language}/overview.json`);
  }

  async getModule(language: string, moduleSlug: string): Promise<ModuleDoc> {
    const folder = await this.moduleFolder(language, moduleSlug);
    return this.loadJson<ModuleDoc>(`${language}/modules/${folder}/module.json`);
  }

  async getTopic(language: string, moduleSlug: string, topicSlug: string): Promise<Topic> {
    const folder = await this.moduleFolder(language, moduleSlug);
    return this.loadJson<Topic>(`${language}/modules/${folder}/topics/${topicSlug}.json`);
  }

  async getMindmap(language: string, moduleSlug: string): Promise<Mindmap> {
    const folder = await this.moduleFolder(language, moduleSlug);
    return this.loadJson<Mindmap>(`${language}/modules/${folder}/mindmap.json`);
  }

  async getQuickOverview(language: string, moduleSlug: string): Promise<QuickOverview> {
    const folder = await this.moduleFolder(language, moduleSlug);
    return this.loadJson<QuickOverview>(`${language}/modules/${folder}/quick-overview.json`);
  }

  async getInterview(language: string, moduleSlug: string): Promise<InterviewPage> {
    const folder = await this.moduleFolder(language, moduleSlug);
    return this.loadJson<InterviewPage>(`${language}/modules/${folder}/interview.json`);
  }

  async resolveTopicLinks(language: string, topicIds: string[]): Promise<TopicLink[]> {
    const map = await this.topicMap(language);
    return topicIds.map((id) => map.get(id)).filter((link): link is TopicLink => !!link);
  }

  private async moduleFolder(language: string, moduleSlug: string): Promise<string> {
    const index = await this.getIndex(language);
    const match = index.modules.find((item) => item.slug === moduleSlug);
    if (!match) {
      throw new Error(`Unknown module slug ${moduleSlug} for ${language}`);
    }
    return match.folder;
  }

  private topicMap(language: string): Promise<Map<string, TopicLink>> {
    const cached = this.topicMaps.get(language);
    if (cached) {
      return cached;
    }
    const pending = this.buildTopicMap(language);
    this.topicMaps.set(language, pending);
    return pending;
  }

  private async buildTopicMap(language: string): Promise<Map<string, TopicLink>> {
    const index = await this.getIndex(language);
    const map = new Map<string, TopicLink>();
    for (const moduleRef of index.modules) {
      const moduleDoc = await this.loadJson<ModuleDoc>(`${language}/modules/${moduleRef.folder}/module.json`);
      for (const topic of moduleDoc.topics) {
        map.set(topic.id, {
          id: topic.id,
          language,
          moduleSlug: moduleRef.slug,
          topicSlug: topic.slug,
          title: topic.title,
        });
      }
    }
    return map;
  }

  private loadJson<T>(relativePath: string): Promise<T> {
    const url = this.contentUrl(relativePath);
    const cached = this.cache.get(url);
    if (cached) {
      return cached as Promise<T>;
    }
    const pending = firstValueFrom(this.http.get<T>(url));
    this.cache.set(url, pending);
    return pending;
  }

  private contentUrl(relativePath: string): string {
    const base = this.baseHref.endsWith('/') ? this.baseHref : `${this.baseHref}/`;
    return `${base}content/${relativePath}`;
  }
}
