
import React from 'react';
import { Home, ShoppingBag, Tag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white text-black p-4 border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://framerusercontent.com/images/AFbK2JQrK2exSW8HvSoiZnBDYY.svg" 
              alt="Nothessamo Cafe Logo" 
              className="h-10 w-auto"
            />
            <h1 className="text-xl font-bold hidden md:block">Nothessamo Cafe</h1>
          </div>
          
          {/* Desktop menu */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link 
                  to="/" 
                  className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === '/' ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Painel</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                    location.pathname.includes('/products') ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Produtos</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                    location.pathname.includes('/categories') ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-gray-100'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  <span>Categorias</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white p-2 border-b">
        <div className="container mx-auto">
          <ul className="flex justify-between">
            <li className="flex-1 text-center">
              <Link 
                to="/" 
                className={`flex flex-col items-center py-1 px-2 rounded-md ${
                  location.pathname === '/' ? 'text-primary font-medium' : 'text-gray-600'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Painel</span>
              </Link>
            </li>
            <li className="flex-1 text-center">
              <Link 
                to="/products" 
                className={`flex flex-col items-center py-1 px-2 rounded-md ${
                  location.pathname.includes('/products') ? 'text-primary font-medium' : 'text-gray-600'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs mt-1">Produtos</span>
              </Link>
            </li>
            <li className="flex-1 text-center">
              <Link 
                to="/categories" 
                className={`flex flex-col items-center py-1 px-2 rounded-md ${
                  location.pathname.includes('/categories') ? 'text-primary font-medium' : 'text-gray-600'
                }`}
              >
                <Tag className="h-5 w-5" />
                <span className="text-xs mt-1">Categorias</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-muted-foreground border-t">
        <div className="container mx-auto">
          Nothessamo Cafe - Gerencial &copy; {new Date().getFullYear()}
          <p className="mt-1">Construído por pi3t.community</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
