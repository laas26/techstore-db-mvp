// Compõe o shell global da aplicação, roteamento, autenticação e carrinho.
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductCatalogProvider } from './context/ProductCatalogContext';
import { AppRoutes } from './routes/AppRoutes';

// Define o layout global e controla quais paginas exibem a navegacao.
function AppShell() {
  const { pathname } = useLocation();
  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);
  const isHomePage = pathname === '/';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main style={{ padding: isAuthPage || isHomePage ? 0 : '2rem' }}>
        <AppRoutes />
      </main>
    </>
  );
}

function App() {
  // Registra o roteador e o contexto de autenticacao na raiz da aplicacao.
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductCatalogProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </ProductCatalogProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
