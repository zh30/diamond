import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageProps {
  path: string;
}

export default function Page({ path }: PageProps) {
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!path) {
      navigate('/');
      return;
    }

    fetch(`/content/${path}.html`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Page not found');
        }
        return res.text();
      })
      .then(html => {
        setContent(html);
      })
      .catch(error => {
        console.error('Error loading page:', error);
        navigate('/');
      });
  }, [path, navigate]);

  return (
    <article 
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
} 