import { listLanguageParams, listModuleParams, listTopicParams } from './prerender-params';

describe('prerender params', () => {
  it('lists csharp as a prerender language', () => {
    expect(listLanguageParams()).toContainEqual({ language: 'csharp' });
  });

  it('lists 18 csharp modules', () => {
    const modules = listModuleParams().filter((item) => item.language === 'csharp');
    expect(modules).toHaveLength(18);
  });

  it('lists every csharp topic from module.json', () => {
    const topics = listTopicParams().filter((item) => item.language === 'csharp');
    expect(topics.length).toBeGreaterThanOrEqual(100);
    expect(topics.some((item) => item.topicSlug === 'entry-points')).toBe(true);
  });
});
