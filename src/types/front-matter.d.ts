declare module 'front-matter' {
  interface FrontMatterResult<T = any> {
    attributes: T;
    body: string;
    frontmatter: string;
    bodyBegin: number;
  }

  function frontMatter<T = any>(str: string): FrontMatterResult<T>;
  
  export = frontMatter;
} 