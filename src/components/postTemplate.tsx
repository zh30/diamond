import Template from './template';
import type { PostWithContent } from '../parser/build';

export default function PostTemplate({
  post,
}: {
  post: PostWithContent;
  }) {
  const { title, date, description, content, path, keywords } = post;

  return <Template
    title={title}
    description={description}
    keywords={keywords}
    path={path}
  >
    <article>
      <header>
        <h1>{title}</h1>
        <div>{new Date(date).toLocaleDateString()}</div>
      </header>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  </Template>;
}
