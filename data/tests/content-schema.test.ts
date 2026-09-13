import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ContentIndex, InterviewPage, Mindmap, ModuleDoc, OverviewPage, QuickOverview, Topic } from '../contracts/content.models.ts';

const require = createRequire(`${process.cwd()}/data/tests/content-schema.test.ts`);
const Ajv2020 = require('ajv/dist/2020.js') as new (options?: object) => {
  addSchema: (schema: unknown) => void;
  compile: (schema: unknown) => ((data: unknown) => boolean) & { errors?: unknown };
};
const addFormats = require('ajv-formats') as (ajv: unknown) => void;

const root = process.cwd();
const dataRoot = path.join(root, 'data');
const schemaDir = path.join(dataRoot, 'schemas');
const csharpRoot = path.join(dataRoot, 'csharp');

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

function listModuleFolders(): string[] {
  const modulesDir = path.join(csharpRoot, 'modules');
  if (!existsSync(modulesDir)) {
    return [];
  }
  return readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(modulesDir, entry.name))
    .sort();
}

function snippetCount(topic: Topic): number {
  return topic.sections.reduce((total, section) => total + (section.snippets?.length ?? 0), 0);
}

describe('C# content schemas', () => {
  it('validates index.json when present', () => {
    const indexPath = path.join(csharpRoot, 'index.json');
    if (!existsSync(indexPath)) {
      return;
    }
    const validate = compile('index.schema.json');
    const data = loadJson(indexPath);
    expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
  });

  it('validates overview.json when present', () => {
    const overviewPath = path.join(csharpRoot, 'overview.json');
    if (!existsSync(overviewPath)) {
      return;
    }
    const validate = compile('overview.schema.json');
    const data = loadJson(overviewPath);
    expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
  });

  it('validates every module folder against schemas', () => {
    const validateModule = compile('module.schema.json');
    const validateTopic = compile('topic.schema.json');
    const validateMindmap = compile('mindmap.schema.json');
    const validateQuick = compile('quick-overview.schema.json');
    const validateInterview = compile('interview.schema.json');

    for (const folder of listModuleFolders()) {
      const moduleDoc = loadJson(path.join(folder, 'module.json'));
      expect(validateModule(moduleDoc), `${folder} module ${JSON.stringify(validateModule.errors)}`).toBe(true);

      const mindmap = loadJson(path.join(folder, 'mindmap.json'));
      expect(validateMindmap(mindmap), `${folder} mindmap ${JSON.stringify(validateMindmap.errors)}`).toBe(true);

      const quick = loadJson(path.join(folder, 'quick-overview.json'));
      expect(validateQuick(quick), `${folder} quick-overview ${JSON.stringify(validateQuick.errors)}`).toBe(true);

      const interview = loadJson(path.join(folder, 'interview.json'));
      expect(validateInterview(interview), `${folder} interview ${JSON.stringify(validateInterview.errors)}`).toBe(true);

      const topicsDir = path.join(folder, 'topics');
      const topicFiles = readdirSync(topicsDir).filter((name) => name.endsWith('.json'));
      expect(topicFiles.length).toBeGreaterThan(0);

      for (const file of topicFiles) {
        const topic = loadJson(path.join(topicsDir, file));
        expect(validateTopic(topic), `${file} ${JSON.stringify(validateTopic.errors)}`).toBe(true);
      }
    }
  });

  it('enforces unique ids, topic snippets, official sources, and relatedTopicIds', () => {
    const topics: Topic[] = [];
    const moduleIds = new Set<string>();

    for (const folder of listModuleFolders()) {
      const moduleDoc = loadJson(path.join(folder, 'module.json')) as ModuleDoc;
      expect(moduleIds.has(moduleDoc.id)).toBe(false);
      moduleIds.add(moduleDoc.id);

      const mindmap = loadJson(path.join(folder, 'mindmap.json')) as Mindmap;
      const quick = loadJson(path.join(folder, 'quick-overview.json')) as QuickOverview;
      const interview = loadJson(path.join(folder, 'interview.json')) as InterviewPage;
      expect(mindmap.moduleId).toBe(moduleDoc.id);
      expect(quick.moduleId).toBe(moduleDoc.id);
      expect(interview.moduleId).toBe(moduleDoc.id);

      const topicFiles = readdirSync(path.join(folder, 'topics')).filter((name) => name.endsWith('.json'));
      const slugs = new Set(moduleDoc.topics.map((item) => item.slug));
      expect(topicFiles.length).toBe(moduleDoc.topics.length);

      for (const file of topicFiles) {
        const topic = loadJson(path.join(folder, 'topics', file)) as Topic;
        expect(topic.moduleId).toBe(moduleDoc.id);
        expect(slugs.has(topic.slug)).toBe(true);
        expect(snippetCount(topic)).toBeGreaterThanOrEqual(1);
        expect(topic.officialSources.length).toBeGreaterThanOrEqual(1);
        topics.push(topic);
      }
    }

    const topicIds = topics.map((topic) => topic.id);
    expect(new Set(topicIds).size).toBe(topicIds.length);

    const indexPath = path.join(csharpRoot, 'index.json');
    let expectedModuleCount = 0;
    if (existsSync(indexPath) && moduleIds.size > 0) {
      const index = loadJson(indexPath) as ContentIndex;
      expectedModuleCount = index.modules.length;
      for (const id of moduleIds) {
        expect(
          index.modules.some((item) => item.id === id),
          `index.json is missing module ${id}`,
        ).toBe(true);
      }
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

    const overviewPath = path.join(csharpRoot, 'overview.json');
    if (existsSync(overviewPath)) {
      const overview = loadJson(overviewPath) as OverviewPage;
      expect(overview.language).toBe('csharp');
    }
  });
});
