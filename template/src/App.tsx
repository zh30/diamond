import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Page from './components/Page';
import { SiteData, Page as PageType } from './types';

function App() {
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  useEffect(() => {
    fetch('/site-data.json')
      .then(res => res.json())
      .then(data => {
        setSiteData(data);
        // Set CSS variables for theme colors
        if (data.config.theme) {
          document.documentElement.style.setProperty('--primary-color', data.config.theme.primary);
          document.documentElement.style.setProperty('--secondary-color', data.config.theme.secondary);
        }
      });
  }, []);

  if (!siteData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar pages={siteData.pages} siteTitle={siteData.config.title} />
        <main className="flex-1 p-8">
          <Routes>
            {siteData.pages.map((page: PageType) => (
              <Route
                key={page.path}
                path={`/${page.path}`}
                element={<Page path={page.path} />}
              />
            ))}
            <Route
              path="/"
              element={<Page path={siteData.pages[0]?.path || ''} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
