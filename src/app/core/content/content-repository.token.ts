import { InjectionToken } from '@angular/core';
import type { ContentRepository } from './content-repository';

export const CONTENT_REPOSITORY = new InjectionToken<ContentRepository>('CONTENT_REPOSITORY');
