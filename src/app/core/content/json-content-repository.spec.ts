import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { JsonContentRepository } from './json-content-repository';

describe('JsonContentRepository', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_BASE_HREF, useValue: '/' },
        JsonContentRepository,
      ],
    });
  });

  it('loads catalog JSON from the content root', async () => {
    const repo = TestBed.inject(JsonContentRepository);
    const http = TestBed.inject(HttpTestingController);
    const pending = repo.getCatalog();
    http.expectOne('/content/catalog.json').flush({
      groups: [{ id: 'languages', title: 'Languages', itemIds: ['csharp'] }],
      items: [
        {
          id: 'csharp',
          title: 'C#',
          group: 'languages',
          status: 'available',
          summary: 'Live',
        },
      ],
    });
    const catalog = await pending;
    expect(catalog.items[0].id).toBe('csharp');
    http.verify();
  });

  it('resolves related topic ids through the module map', async () => {
    const repo = TestBed.inject(JsonContentRepository);
    const http = TestBed.inject(HttpTestingController);
    const pending = repo.resolveTopicLinks('csharp', ['csharp-01-entry-points']);
    http.expectOne('/content/csharp/index.json').flush({
      language: 'csharp',
      title: 'C#',
      stages: [],
      modules: [
        {
          id: 'csharp-01-program-and-compilation',
          slug: 'program-and-compilation',
          title: 'Program',
          order: 1,
          stage: 'foundation',
          folder: '01-program-and-compilation',
          topicCount: 1,
        },
      ],
    });
    await Promise.resolve();
    http.expectOne('/content/csharp/modules/01-program-and-compilation/module.json').flush({
      id: 'csharp-01-program-and-compilation',
      slug: 'program-and-compilation',
      title: 'Program',
      order: 1,
      stage: 'foundation',
      summary: 's',
      officialHubs: [{ title: 't', url: 'https://learn.microsoft.com' }],
      topics: [{ id: 'csharp-01-entry-points', slug: 'entry-points', title: 'Entry points', order: 1 }],
    });

    const links = await pending;
    expect(links).toEqual([
      {
        id: 'csharp-01-entry-points',
        language: 'csharp',
        moduleSlug: 'program-and-compilation',
        topicSlug: 'entry-points',
        title: 'Entry points',
      },
    ]);
    http.verify();
  });
});
