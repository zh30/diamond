import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { marked } from 'marked';
import frontMatter from 'front-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Config {
  title: string;
  description: string;
  baseUrl: string;
  theme?: {
    primary: string;
    secondary: string;
  };
}

interface PageAttributes {
  title?: string;
  description?: string;
  date?: string;
  [key: string]: unknown;
}

interface FrontMatterResult {
  attributes: PageAttributes;
  body: string;
}

interface Post {
  path: string;
  title: string;
  description: string;
  date: string;
  metadata: PageAttributes;
}

interface PostWithContent extends Post {
  content: string;
}

interface SiteData {
  config: Config;
  posts: Post[];
}

const DEFAULT_CONFIG: Config = {
  title: 'Diamond Documentation',
  description: 'Documentation generated with Diamond',
  baseUrl: '/',
  theme: {
    primary: '#3b82f6',
    secondary: '#10b981'
  }
};

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
    ignore: ['node_modules/**', 'dist/**', 'README.md']
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

  // Generate post HTML files
  for (const post of posts) {
    const outputPath = join(distDir, `${post.path}.html`);
    mkdirSync(dirname(outputPath), { recursive: true });
    const postHtml = generatePostHtml(post.content, post, siteData);
    writeFileSync(outputPath, postHtml);
  }

  // Generate index page
  const indexHtml = generateIndexHtml(siteData);
  writeFileSync(join(distDir, 'index.html'), indexHtml);
}

function generatePostHtml(content: string, post: Post, siteData: SiteData): string {
  const { title, description, path, date } = post;
  const { config, posts } = siteData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${config.title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="/${path}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="article:published_time" content="${date}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <style>
    :root {
      --primary-color: ${config.theme?.primary || '#3b82f6'};
      --secondary-color: ${config.theme?.secondary || '#10b981'};
    }
  </style>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root">
    <div class="flex min-h-screen bg-gray-50">
      <aside class="w-64 bg-white border-r border-gray-200 p-6">
        <a href="/" class="block">
          <h1 class="text-2xl font-bold text-gray-900 mb-8">${config.title}</h1>
        </a>
        <nav>
          <div class="mb-4 text-sm font-medium text-gray-500">Recent Posts</div>
          <ul class="space-y-2">
            ${posts.slice(0, 5).map((p) => `
              <li>
                <a
                  href="/${p.path}"
                  class="block px-4 py-2 rounded-lg transition-colors ${p.path === path
      ? 'bg-primary text-white'
      : 'text-gray-600 hover:bg-gray-100'
    }"
                >
                  ${p.title}
                </a>
              </li>
            `).join('')}
          </ul>
        </nav>
      </aside>
      <main class="flex-1 p-8">
        <article class="prose prose-slate max-w-none">
          <header class="mb-8">
            <h1 class="mb-2">${title}</h1>
            <div class="text-gray-500">${new Date(date).toLocaleDateString()}</div>
          </header>
          ${content}
        </article>
      </main>
    </div>
  </div>
  <script type="module" src="../assets/index.js"></script>
</body>
</html>`;
}

function generateIndexHtml(siteData: SiteData): string {
  const { config, posts } = siteData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <meta name="description" content="${config.description}">
  <link rel="canonical" href="/">
  <meta property="og:title" content="${config.title}">
  <meta property="og:description" content="${config.description}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${config.title}">
  <meta name="twitter:description" content="${config.description}">
  <style>
    :root {
      --primary-color: ${config.theme?.primary || '#3b82f6'};
      --secondary-color: ${config.theme?.secondary || '#10b981'};
    }
  </style>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root">
    <div class="flex min-h-screen bg-gray-50">
      <aside class="w-64 bg-white border-r border-gray-200 p-6">
        <a href="/" class="block">
          <h1 class="text-2xl font-bold text-gray-900 mb-8">${config.title}</h1>
        </a>
        <nav>
          <div class="mb-4 text-sm font-medium text-gray-500">Recent Posts</div>
          <ul class="space-y-2">
            ${posts.slice(0, 5).map((post) => `
              <li>
                <a
                  href="/${post.path}"
                  class="block px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
                >
                  ${post.title}
                </a>
              </li>
            `).join('')}
          </ul>
        </nav>
      </aside>
      <main class="flex-1 p-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">Latest Posts</h1>
          <div class="space-y-8">
            ${posts.map((post) => `
              <article class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  <a href="/${post.path}" class="hover:text-primary">${post.title}</a>
                </h2>
                <div class="text-gray-500 mb-4">${new Date(post.date).toLocaleDateString()}</div>
                ${post.description ? `<p class="text-gray-600 mb-4">${post.description}</p>` : ''}
                <a href="/${post.path}" class="text-primary hover:text-primary/80">Read more →</a>
              </article>
            `).join('')}
          </div>
        </main>
      </div>
    </div>
  </div>
  <script type="module" src="./assets/index.js"></script>
</body>
</html>`;
} 