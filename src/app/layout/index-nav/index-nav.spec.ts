import { convertToParamMap } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CONTENT_REPOSITORY } from '../../core/content/content-repository.token';
import { IndexNav } from './index-nav';

describe('IndexNav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexNav],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ language: 'csharp' }) },
            paramMap: of(convertToParamMap({ language: 'csharp' })),
          },
        },
        {
          provide: CONTENT_REPOSITORY,
          useValue: {
            getIndex: async () => ({
              language: 'csharp',
              title: 'C#',
              stages: [
                {
                  id: 'foundation',
                  title: 'Foundations',
                  summary: 's',
                  moduleIds: ['m1'],
                },
              ],
              modules: [
                {
                  id: 'm1',
                  slug: 'program-and-compilation',
                  title: 'Program',
                  order: 1,
                  stage: 'foundation',
                  folder: '01-program-and-compilation',
                  topicCount: 1,
                },
              ],
            }),
            getModule: async () => ({
              id: 'm1',
              slug: 'program-and-compilation',
              title: 'Program',
              order: 1,
              stage: 'foundation',
              summary: 's',
              officialHubs: [{ title: 't', url: 'https://learn.microsoft.com' }],
              topics: [{ id: 't1', slug: 'entry-points', title: 'Entry points', order: 1 }],
            }),
          },
        },
      ],
    }).compileComponents();
  });

  it('keeps the current module expanded', async () => {
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', {
      get: () => '/docs/csharp/modules/program-and-compilation/topics/entry-points',
    });
    const fixture = TestBed.createComponent(IndexNav);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.isModuleOpen('program-and-compilation')).toBe(true);
  });
});
