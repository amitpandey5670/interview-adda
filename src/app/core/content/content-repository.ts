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

export interface ContentRepository {
  getCatalog(): Promise<Catalog>;
  getIndex(language: string): Promise<ContentIndex>;
  getOverview(language: string): Promise<OverviewPage>;
  getModule(language: string, moduleSlug: string): Promise<ModuleDoc>;
  getTopic(language: string, moduleSlug: string, topicSlug: string): Promise<Topic>;
  getMindmap(language: string, moduleSlug: string): Promise<Mindmap>;
  getQuickOverview(language: string, moduleSlug: string): Promise<QuickOverview>;
  getInterview(language: string, moduleSlug: string): Promise<InterviewPage>;
  resolveTopicLinks(language: string, topicIds: string[]): Promise<TopicLink[]>;
}
