import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { marked } from 'marked';
import frontMatter from 'front-matter';
import { fileURLToPath } from 'url';
import HomeTemplate from '../components/homeTemplate.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PostTemplate from '../components/postTemplate.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Config {
  title: string;
  description: string;
  keywords: string;
  baseUrl: string;
  theme?: {
    primary: string;
    secondary: string;
  };
}

export interface PageAttributes {
  title?: string;
  description?: string;
  date?: string;
  [key: string]: unknown;
}

export interface FrontMatterResult {
  attributes: PageAttributes;
  body: string;
}

export interface Post {
  path: string;
  title: string;
  description: string;
  keywords: string;
  date: string;
  metadata: PageAttributes;
}

export interface PostWithContent extends Post {
  content: string;
}

export interface SiteData {
  config: Config;
  posts: Post[];
}

export const DEFAULT_CONFIG: Config = {
  title: 'Diamond Documentation',
  description: 'Documentation generated with Diamond',
  keywords: 'Documentation, Diamond, Documentation',
  baseUrl: '/',
  theme: {
    primary: '#3b82f6',
    secondary: '#10b981'
  }
};

function generateSitemap(config: Config, posts: Post[]): string {
  const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl : `${config.baseUrl}/`;
  const today = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}${post.path}.html</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;
}

export async function build() {
  const cwd = process.cwd();

  // Read config file if it exists
  let config = DEFAULT_CONFIG;

  if (existsSync('config.json')) {
    const configContent = readFileSync('config.json', 'utf-8');
    config = { ...DEFAULT_CONFIG, ...JSON.parse(configContent) };
  }

  // Create dist directory if it doesn't exist
  const distDir = join(cwd, 'dist');

  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true });
  }
  mkdirSync(distDir, { recursive: true });

  // Find all markdown files
  const files = await glob('**/*.md', {
    ignore: ['node_modules/**', 'dist/**', '.obsidian/**', 'README.md']
  });

  // Create posts directory
  const postsDir = join(distDir, 'posts');
  mkdirSync(postsDir, { recursive: true });

  // Process each markdown file
  const posts = await Promise.all(
    files.map(async (file) => {
      const content = readFileSync(file, 'utf-8');
      const parsed = frontMatter(content) as FrontMatterResult;
      const html = marked.parse(parsed.body);

      if (typeof html !== 'string') {
        throw new Error('Marked failed to generate HTML string');
      }

      // Get file creation date if not specified in frontmatter
      const date = parsed.attributes.date || new Date().toISOString().split('T')[0];

      return {
        path: `posts/${file.replace(/\.md$/, '')}`,
        title: parsed.attributes.title || file.replace(/\.md$/, ''),
        description: parsed.attributes.description || '',
        keywords: parsed.attributes.keywords || '',
        date,
        metadata: parsed.attributes,
        content: html
      } as PostWithContent;
    })
  );

  // Sort posts by date in descending order
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate site data
  const siteData: SiteData = {
    config,
    posts: posts.map(({ content, ...post }) => post)
  };

  // Write site data
  writeFileSync(
    join(distDir, 'site-data.json'),
    JSON.stringify(siteData, null, 2)
  );

  // Generate sitemap.xml
  const sitemap = generateSitemap(config, siteData.posts);
  writeFileSync(join(distDir, 'sitemap.xml'), sitemap);

  // Generate post HTML files
  for (const post of posts) {
    const outputPath = join(distDir, `${post.path}.html`);
    mkdirSync(dirname(outputPath), { recursive: true });
    const postHtml = generatePostHtml(post, siteData);
    writeFileSync(outputPath, postHtml);
  }

  // Generate index page
  const indexHtml = generateIndexHtml(siteData);
  writeFileSync(join(distDir, 'index.html'), indexHtml);
}

function generatePostHtml(post: PostWithContent, siteData: SiteData): string {
  const reactElement = React.createElement(PostTemplate, { post });
  const html = '<!DOCTYPE html>' + ReactDOMServer.renderToString(reactElement);

  return html;
}

function generateIndexHtml(siteData: SiteData): string {
  const { config, posts } = siteData;
  const reactElement = React.createElement(HomeTemplate, { posts });
  const html = '<!DOCTYPE html>' + ReactDOMServer.renderToString(reactElement);

  return html;
} 
