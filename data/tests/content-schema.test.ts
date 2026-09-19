import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  countTopicSnippets,
  topicHasDiagram,
  topicHasGlossary,
  topicHasSeniorSection,
  topicHasSixtySecondTakeaway,
  type ContentIndex,
  type InterviewPage,
  type Mindmap,
  type ModuleDoc,
  type OverviewPage,
  type QuickOverview,
  type Stage,
  type Topic,
} from '../contracts/content.models.ts';

const require = createRequire(`${process.cwd()}/data/tests/content-schema.test.ts`);
const Ajv2020 = require('ajv/dist/2020.js') as new (options?: object) => {
  addSchema: (schema: unknown) => void;
  compile: (schema: unknown) => ((data: unknown) => boolean) & { errors?: unknown };
};
const addFormats = require('ajv-formats') as (ajv: unknown) => void;

const root = process.cwd();
const dataRoot = path.join(root, 'data');
const schemaDir = path.join(dataRoot, 'schemas');

const TRACKS = ['csharp', 'aws'] as const;

function loadJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
}

function createValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(loadJson(path.join(schemaDir, 'definitions.json')));
  return ajv;
}

function compile(schemaName: string) {
  const ajv = createValidator();
  return ajv.compile(loadJson(path.join(schemaDir, schemaName)));
}

function trackRoot(language: string): string {
  return path.join(dataRoot, language);
}

function listModuleFolders(language: string): string[] {
  const modulesDir = path.join(trackRoot(language), 'modules');
  if (!existsSync(modulesDir)) {
    return [];
  }
  return readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(modulesDir, entry.name))
    .sort();
}

function collectTopicIds(language: string): Set<string> {
  const ids = new Set<string>();
  for (const folder of listModuleFolders(language)) {
    const topicsDir = path.join(folder, 'topics');
    if (!existsSync(topicsDir)) {
      continue;
    }
    for (const file of readdirSync(topicsDir).filter((name) => name.endsWith('.json'))) {
      const topic = loadJson(path.join(topicsDir, file)) as Topic;
      ids.add(topic.id);
    }
  }
  return ids;
}

function isUpgradedMindmap(mindmap: Mindmap): boolean {
  return Boolean(mindmap.overviewDiagram && (mindmap.conceptCards?.length ?? 0) >= 4);
}

function isSeniorStage(stage: Stage): boolean {
  return stage === 'intermediate' || stage === 'advanced';
}

function requiresSeniorDepth(stage: Stage, upgradedModule: boolean): boolean {
  return upgradedModule && isSeniorStage(stage);
}

function validateTrack(language: string): void {
  const langRoot = trackRoot(language);
  const indexPath = path.join(langRoot, 'index.json');
  if (!existsSync(indexPath)) {
    return;
  }

  const validate = compile('index.schema.json');
  const index = loadJson(indexPath);
  expect(validate(index), `${language} index ${JSON.stringify(validate.errors)}`).toBe(true);

  const overviewPath = path.join(langRoot, 'overview.json');
  if (existsSync(overviewPath)) {
    const validateOverview = compile('overview.schema.json');
    const overview = loadJson(overviewPath);
    expect(validateOverview(overview), `${language} overview ${JSON.stringify(validateOverview.errors)}`).toBe(
      true,
    );
  }

  const validateModule = compile('module.schema.json');
  const validateTopic = compile('topic.schema.json');
  const validateMindmap = compile('mindmap.schema.json');
  const validateQuick = compile('quick-overview.schema.json');
  const validateInterview = compile('interview.schema.json');

  const topics: Topic[] = [];
  const moduleIds = new Set<string>();

  for (const folder of listModuleFolders(language)) {
    const moduleDoc = loadJson(path.join(folder, 'module.json'));
    expect(validateModule(moduleDoc), `${folder} module ${JSON.stringify(validateModule.errors)}`).toBe(true);

    const mindmap = loadJson(path.join(folder, 'mindmap.json'));
    expect(validateMindmap(mindmap), `${folder} mindmap ${JSON.stringify(validateMindmap.errors)}`).toBe(true);

    const quick = loadJson(path.join(folder, 'quick-overview.json'));
    expect(validateQuick(quick), `${folder} quick-overview ${JSON.stringify(validateQuick.errors)}`).toBe(true);

    const interview = loadJson(path.join(folder, 'interview.json'));
    expect(validateInterview(interview), `${folder} interview ${JSON.stringify(validateInterview.errors)}`).toBe(
      true,
    );

    const topicsDir = path.join(folder, 'topics');
    const topicFiles = readdirSync(topicsDir).filter((name) => name.endsWith('.json'));
    expect(topicFiles.length).toBeGreaterThan(0);

    for (const file of topicFiles) {
      const topic = loadJson(path.join(topicsDir, file));
      expect(validateTopic(topic), `${file} ${JSON.stringify(validateTopic.errors)}`).toBe(true);
    }
  }

  for (const folder of listModuleFolders(language)) {
    const moduleDoc = loadJson(path.join(folder, 'module.json')) as ModuleDoc;
    expect(moduleIds.has(moduleDoc.id)).toBe(false);
    moduleIds.add(moduleDoc.id);

    const mindmap = loadJson(path.join(folder, 'mindmap.json')) as Mindmap;
    const quick = loadJson(path.join(folder, 'quick-overview.json')) as QuickOverview;
    const interview = loadJson(path.join(folder, 'interview.json')) as InterviewPage;
    expect(mindmap.moduleId).toBe(moduleDoc.id);
    expect(quick.moduleId).toBe(moduleDoc.id);
    expect(interview.moduleId).toBe(moduleDoc.id);

    if (isUpgradedMindmap(mindmap)) {
      expect(mindmap.intro, `${folder} mindmap intro`).toBeTruthy();
      expect(mindmap.revisionDiagram, `${folder} revision diagram`).toBeTruthy();
    }

    const topicFiles = readdirSync(path.join(folder, 'topics')).filter((name) => name.endsWith('.json'));
    const slugs = new Set(moduleDoc.topics.map((item) => item.slug));
    expect(topicFiles.length).toBe(moduleDoc.topics.length);

    const upgradedModule = isUpgradedMindmap(mindmap);
    const seniorModule = requiresSeniorDepth(moduleDoc.stage, upgradedModule);

    for (const file of topicFiles) {
      const topic = loadJson(path.join(folder, 'topics', file)) as Topic;
      expect(topic.moduleId).toBe(moduleDoc.id);
      expect(slugs.has(topic.slug)).toBe(true);
      expect(countTopicSnippets(topic)).toBeGreaterThanOrEqual(seniorModule ? 4 : upgradedModule ? 3 : 1);
      expect(topic.officialSources.length).toBeGreaterThanOrEqual(1);

      if (upgradedModule) {
        expect(topic.sections.length, `${topic.id} sections`).toBeGreaterThanOrEqual(4);
        expect(topicHasGlossary(topic), `${topic.id} glossary`).toBe(true);
        expect(topicHasDiagram(topic), `${topic.id} diagram`).toBe(true);
      }

      if (seniorModule) {
        expect(topic.sections.length, `${topic.id} senior sections`).toBeGreaterThanOrEqual(6);
        expect(topicHasSeniorSection(topic), `${topic.id} senior section`).toBe(true);
        expect(topic.interviewTakeaways.length, `${topic.id} takeaways`).toBeGreaterThanOrEqual(5);
        expect(topicHasSixtySecondTakeaway(topic), `${topic.id} 60s takeaway`).toBe(true);
        expect(topic.jsTsCorrelations.length, `${topic.id} correlations`).toBeGreaterThanOrEqual(2);
      }

      topics.push(topic);
    }
  }

  const topicIds = topics.map((topic) => topic.id);
  expect(new Set(topicIds).size).toBe(topicIds.length);

  const contentIndex = loadJson(indexPath) as ContentIndex;
  const expectedModuleCount = contentIndex.modules.length;
  for (const id of moduleIds) {
    expect(contentIndex.modules.some((item) => item.id === id), `index.json is missing module ${id}`).toBe(true);
  }

  const idSet = new Set(topicIds);
  const graphIsComplete = expectedModuleCount > 0 && moduleIds.size === expectedModuleCount;
  if (graphIsComplete) {
    for (const topic of topics) {
      for (const relatedId of topic.relatedTopicIds) {
        expect(idSet.has(relatedId), `${topic.id} relatedTopicIds missing ${relatedId}`).toBe(true);
      }
    }
  }

  if (existsSync(overviewPath)) {
    const overview = loadJson(overviewPath) as OverviewPage;
    expect(overview.language).toBe(language);
  }
}

describe('Content schemas', () => {
  for (const language of TRACKS) {
    describe(`${language} track`, () => {
      it(`validates ${language} content when present`, () => {
        validateTrack(language);
      });
    });
  }
});
