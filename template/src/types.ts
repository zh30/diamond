export interface Config {
  title: string;
  description: string;
  baseUrl: string;
  theme?: {
    primary: string;
    secondary: string;
  };
}

export interface PageMetadata {
  title?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface Page {
  path: string;
  title: string;
  metadata: PageMetadata;
}

export interface SiteData {
  config: Config;
  pages: Page[];
} 