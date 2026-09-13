import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ContentIndex, ModuleDoc } from '@content-models';

export type LanguageParams = Record<string, string> & { language: string };
export type ModuleParams = Record<string, string> & { language: string; moduleSlug: string };
export type TopicParams = Record<string, string> & {
  language: string;
  moduleSlug: string;
  topicSlug: string;
};

function dataRoot(): string {
  const fromCwd = join(process.cwd(), 'data');
  if (existsSync(fromCwd)) {
    return fromCwd;
  }
  return join(dirname(fileURLToPath(import.meta.url)), '../../../../data');
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

export function listAvailableLanguages(): string[] {
  const root = dataRoot();
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'index.json')))
    .map((entry) => entry.name);
}

export function listLanguageParams(): LanguageParams[] {
  return listAvailableLanguages().map((language) => ({ language }));
}

export function listModuleParams(): ModuleParams[] {
  const root = dataRoot();
  const params: ModuleParams[] = [];
  for (const language of listAvailableLanguages()) {
    const index = readJson<ContentIndex>(join(root, language, 'index.json'));
    for (const moduleRef of index.modules) {
      params.push({ language, moduleSlug: moduleRef.slug });
    }
  }
  return params;
}

export function listTopicParams(): TopicParams[] {
  const root = dataRoot();
  const params: TopicParams[] = [];
  for (const language of listAvailableLanguages()) {
    const index = readJson<ContentIndex>(join(root, language, 'index.json'));
    for (const moduleRef of index.modules) {
      const moduleDoc = readJson<ModuleDoc>(join(root, language, 'modules', moduleRef.folder, 'module.json'));
      for (const topic of moduleDoc.topics) {
        params.push({ language, moduleSlug: moduleRef.slug, topicSlug: topic.slug });
      }
    }
  }
  return params;
}
