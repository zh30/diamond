import { Link, useLocation } from 'react-router-dom';
import { Page } from '../types';

interface SidebarProps {
  pages: Page[];
  siteTitle: string;
}

export default function Sidebar({ pages, siteTitle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{siteTitle}</h1>
      <nav>
        <ul className="space-y-2">
          {pages.map(page => (
            <li key={page.path}>
              <Link
                to={`/${page.path}`}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === `/${page.path}`
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 