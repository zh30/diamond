import type { Post } from '../parser/build';
import Template from './template';

export default function HomeTemplate(
  {
    posts,
  }: {
    posts: Post[];
  }
) {
  const recentPosts = posts.slice(0, 5);

  return (
    <Template>
      <div className="container mx-auto flex gap-4 h-screen">
        <aside>
          <nav>
            <ul>
              {recentPosts.map((post) => <li key={`${post.path}-aside`}>
                <a href={`/${post.path}`}>{post.title}</a>
              </li>)}
            </ul>
          </nav>
        </aside>
        <main>
          <h1>Latest Posts</h1>
          {recentPosts.map((post) => <article key={`${post.path}-latest`}>
            <h2><a href={`/${post.path}`}>{post.title}</a></h2>
            <div>{new Date(post.date).toLocaleDateString()}</div>
            {post.description ? <p>{post.description}</p> : null}
            <a href={`/${post.path}`}>Read more →</a>
          </article>)}
        </main>
      </div>
    </Template>
  );
}
