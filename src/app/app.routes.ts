import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { DocLayout } from './layout/doc-layout/doc-layout';
import { OverviewPage } from './pages/overview-page/overview-page';
import { TopicPage } from './pages/topic-page/topic-page';
import { MindmapPage } from './pages/mindmap-page/mindmap-page';
import { QuickOverviewPage } from './pages/quick-overview-page/quick-overview-page';
import { InterviewPage } from './pages/interview-page/interview-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  {
    path: 'docs/:language',
    component: DocLayout,
    children: [
      { path: '', component: OverviewPage },
      { path: 'modules/:moduleSlug/topics/:topicSlug', component: TopicPage },
      { path: 'modules/:moduleSlug/mindmap', component: MindmapPage },
      { path: 'modules/:moduleSlug/quick-overview', component: QuickOverviewPage },
      { path: 'modules/:moduleSlug/interview', component: InterviewPage },
    ],
  },
];
