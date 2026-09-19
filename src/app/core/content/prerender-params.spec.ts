import { listLanguageParams, listModuleParams, listTopicParams } from './prerender-params';

describe('prerender params', () => {
  it('lists csharp and aws as prerender languages', () => {
    const languages = listLanguageParams();
    expect(languages).toContainEqual({ language: 'csharp' });
    expect(languages).toContainEqual({ language: 'aws' });
  });

  it('lists 18 csharp modules', () => {
    const modules = listModuleParams().filter((item) => item.language === 'csharp');
    expect(modules).toHaveLength(18);
  });

  it('lists 18 aws modules', () => {
    const modules = listModuleParams().filter((item) => item.language === 'aws');
    expect(modules).toHaveLength(18);
  });

  it('lists every csharp topic from module.json', () => {
    const topics = listTopicParams().filter((item) => item.language === 'csharp');
    expect(topics.length).toBeGreaterThanOrEqual(100);
    expect(topics.some((item) => item.topicSlug === 'entry-points')).toBe(true);
  });

  it('lists every aws topic from module.json', () => {
    const topics = listTopicParams().filter((item) => item.language === 'aws');
    expect(topics).toHaveLength(98);
    expect(topics.some((item) => item.topicSlug === 'aws-vpc-cidr-subnets')).toBe(true);
  });
});
