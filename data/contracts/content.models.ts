export type Stage = 'foundation' | 'intermediate' | 'advanced';

export type AnimationHint = 'compare' | 'flow' | 'stack-heap' | 'timeline';

export type ScenarioTag =
  | 'sqs-consumer'
  | 'redis-cache'
  | 'rabbitmq'
  | 'skiasharp-dispose'
  | 'auth-token'
  | 'csv-import'
  | 'high-concurrency';

export interface OfficialSource {
  title: string;
  url: string;
}

export interface CodeSnippet {
  language: string;
  label: string;
  code: string;
  explanation: string;
}

export interface ContentSection {
  heading: string;
  prose: string;
  snippets?: CodeSnippet[];
}

export interface JsTsCorrelation {
  language: 'javascript' | 'typescript';
  concept: string;
  note: string;
  futureTopicSlug: string;
}

export interface TopicSummary {
  id: string;
  slug: string;
  title: string;
  order: number;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  moduleId: string;
  order: number;
  hook: string;
  sections: ContentSection[];
  interviewTakeaways: string[];
  commonPitfalls: string[];
  introducedIn?: string;
  relatedTopicIds: string[];
  jsTsCorrelations: JsTsCorrelation[];
  officialSources: OfficialSource[];
  animationHint?: AnimationHint;
  scenarioTag?: ScenarioTag;
}

export interface ModuleDoc {
  id: string;
  slug: string;
  title: string;
  order: number;
  stage: Stage;
  summary: string;
  officialHubs: OfficialSource[];
  topics: TopicSummary[];
}

export interface MindmapNode {
  id: string;
  label: string;
  parentId?: string;
}

export interface MindmapEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Mindmap {
  moduleId: string;
  title: string;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

export interface QuickOverviewRow {
  label: string;
  value: string;
}

export interface QuickOverview {
  moduleId: string;
  title: string;
  rememberThis: string[];
  bullets: string[];
  rows: QuickOverviewRow[];
}

export interface InterviewItem {
  question: string;
  answer: string;
  followUps: string[];
  sixtySeconds: string;
}

export interface InterviewPage {
  moduleId: string;
  title: string;
  items: InterviewItem[];
}

export interface StageGroup {
  id: Stage;
  title: string;
  summary: string;
  moduleIds: string[];
}

export interface TimeMap {
  duration: string;
  focus: string;
  moduleIds: string[];
}

export interface OverviewPage {
  id: string;
  language: string;
  title: string;
  hook: string;
  sections: ContentSection[];
  stages: StageGroup[];
  timeMaps: TimeMap[];
  officialSources: OfficialSource[];
}

export interface IndexModuleRef {
  id: string;
  slug: string;
  title: string;
  order: number;
  stage: Stage;
  folder: string;
  topicCount: number;
}

export interface ContentIndex {
  language: 'csharp';
  title: string;
  stages: StageGroup[];
  modules: IndexModuleRef[];
}
