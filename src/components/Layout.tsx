import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * The signed-in shell: a fixed navigation rail, a sticky header, and one
 * scrolling content column.
 *
 * It is applied once, by the route table, rather than being wrapped around
 * each page's JSX by hand. Several pages used to render `<Layout>` *inside*
 * their own loading and error branches as well as around their content, which
 * mounted a second header and sidebar for the duration of the load.
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-sunken">
      <Sidebar isOpen={isNavOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-h-screen flex-col md:pl-sidebar">
        <Header onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
