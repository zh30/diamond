import { DEFAULT_CONFIG } from '../parser/build';
// import '@/styles/main.css';

export default function Template({
  children,
  path = '/',
  title = DEFAULT_CONFIG.title,
  description = DEFAULT_CONFIG.description,
  keywords = DEFAULT_CONFIG.keywords,
}: {
  children: React.ReactNode;
  path?: string;
  title?: string;
  description?: string;
  keywords?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={path} />
        <link rel="stylesheet" href="/style.css" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
