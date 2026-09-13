import { RenderMode, type ServerRoute } from '@angular/ssr';
import { listLanguageParams, listModuleParams, listTopicParams } from './core/content/prerender-params';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'docs/:language',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return listLanguageParams();
    },
  },
  {
    path: 'docs/:language/modules/:moduleSlug/topics/:topicSlug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return listTopicParams();
    },
  },
  {
    path: 'docs/:language/modules/:moduleSlug/mindmap',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return listModuleParams();
    },
  },
  {
    path: 'docs/:language/modules/:moduleSlug/quick-overview',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return listModuleParams();
    },
  },
  {
    path: 'docs/:language/modules/:moduleSlug/interview',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return listModuleParams();
    },
  },
];
