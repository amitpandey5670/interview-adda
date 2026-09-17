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

export interface GlossaryEntry {
  term: string;
  shortForm?: string;
  longForm: string;
  plainDefinition: string;
  example?: string;
}

export interface MermaidDiagram {
  type: 'mermaid';
  title: string;
  source: string;
  caption?: string;
}

export interface StepItem {
  title: string;
  body: string;
  snippet?: CodeSnippet;
}

export type CalloutVariant = 'tip' | 'remember' | 'warning';

export interface ProseBlock {
  type: 'prose';
  text: string;
}

export interface SnippetBlock {
  type: 'snippet';
  snippet: CodeSnippet;
}

export interface GlossaryBlock {
  type: 'glossary';
  title?: string;
  entries: GlossaryEntry[];
}

export interface DiagramBlock {
  type: 'diagram';
  diagram: MermaidDiagram;
}

export interface StepsBlock {
  type: 'steps';
  title: string;
  items: StepItem[];
}

export interface CalloutBlock {
  type: 'callout';
  variant: CalloutVariant;
  title: string;
  body: string;
}

export interface ComparisonTableBlock {
  type: 'comparisonTable';
  title?: string;
  headers: string[];
  rows: string[][];
}

export type ContentBlock =
  | ProseBlock
  | SnippetBlock
  | GlossaryBlock
  | DiagramBlock
  | StepsBlock
  | CalloutBlock
  | ComparisonTableBlock;

export interface ContentSection {
  heading: string;
  prose?: string;
  snippets?: CodeSnippet[];
  blocks?: ContentBlock[];
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

export interface ConceptCard {
  id: string;
  title: string;
  summary: string;
  example?: string;
  topicSlug?: string;
}

export interface Mindmap {
  moduleId: string;
  title: string;
  intro?: string;
  overviewDiagram?: MermaidDiagram;
  revisionDiagram?: MermaidDiagram;
  conceptCards?: ConceptCard[];
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
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
  language: 'csharp' | 'dotnet' | 'javascript' | 'typescript';
  title: string;
  stages: StageGroup[];
  modules: IndexModuleRef[];
}

/** Count code snippets in a topic (legacy snippets + block snippets). */
export function countTopicSnippets(topic: Topic): number {
  return topic.sections.reduce((total, section) => {
    let count = section.snippets?.length ?? 0;
    for (const block of section.blocks ?? []) {
      if (block.type === 'snippet') {
        count += 1;
      }
      if (block.type === 'steps') {
        count += block.items.filter((item) => item.snippet).length;
      }
    }
    return total + count;
  }, 0);
}

/** Whether a topic includes at least one glossary block. */
export function topicHasGlossary(topic: Topic): boolean {
  return topic.sections.some((section) => section.blocks?.some((block) => block.type === 'glossary'));
}

/** Whether a topic includes at least one diagram block. */
export function topicHasDiagram(topic: Topic): boolean {
  return topic.sections.some((section) => section.blocks?.some((block) => block.type === 'diagram'));
}

/** Whether a topic includes the senior interview depth section. */
export function topicHasSeniorSection(topic: Topic): boolean {
  return topic.sections.some((section) => /senior interview depth/i.test(section.heading));
}

/** Whether interview takeaways include a 60-second script bullet. */
export function topicHasSixtySecondTakeaway(topic: Topic): boolean {
  return topic.interviewTakeaways.some((item) => /60\s*s:/i.test(item) || /60-second/i.test(item));
}
