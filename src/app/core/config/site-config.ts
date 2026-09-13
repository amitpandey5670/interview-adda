import { InjectionToken } from '@angular/core';
import siteConfig from '../../../../config/site.config.json';

export interface SiteConfig {
  siteName: string;
  local: { baseHref: string };
  githubPages: { baseHref: string };
}

export const SITE_CONFIG = new InjectionToken<SiteConfig>('SITE_CONFIG', {
  providedIn: 'root',
  factory: () => siteConfig as SiteConfig,
});
