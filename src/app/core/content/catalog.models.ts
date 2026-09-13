export type CatalogStatus = 'available' | 'coming-soon';

export type CatalogGroupId = 'languages' | 'frameworks' | 'cloud';

export interface CatalogGroup {
  id: CatalogGroupId;
  title: string;
  itemIds: string[];
}

export interface CatalogItem {
  id: string;
  title: string;
  group: CatalogGroupId;
  status: CatalogStatus;
  summary: string;
}

export interface Catalog {
  groups: CatalogGroup[];
  items: CatalogItem[];
}

export interface TopicLink {
  id: string;
  language: string;
  moduleSlug: string;
  topicSlug: string;
  title: string;
}
