
import React from 'react';
import { Coffee } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee size={24} />
            <h1 className="text-xl font-bold">Cafe Inventory</h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-secondary p-2 shadow-sm">
        <div className="container mx-auto">
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/products" 
                className={`px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/products' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                Products
              </Link>
            </li>
            <li>
              <Link 
                to="/categories" 
                className={`px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/categories' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                Categories
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          Cafe Inventory Management &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
