import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { CONTENT_REPOSITORY } from './core/content/content-repository.token';
import { JsonContentRepository } from './core/content/json-content-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    {
      provide: APP_BASE_HREF,
      useFactory: (document: Document) => document.querySelector('base')?.getAttribute('href') ?? '/',
      deps: [DOCUMENT],
    },
    { provide: CONTENT_REPOSITORY, useClass: JsonContentRepository },
  ],
};
