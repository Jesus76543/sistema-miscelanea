import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  PackageOpen, 
  History, 
  Home, 
  Store 
} from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { POSView } from './components/POSView';
import type { Product, Sale } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { SalesHistoryView } from './components/SalesHistoryView';
import './index.css';

// Default mock data to seed localStorage
const DEFAULT_PRODUCTS: Product[] = [
  { id: '7501055300018', name: 'Refresco de Cola 600ml', category: 'Bebidas', price: 18.00, cost: 12.50, stock: 25, minStock: 5 },
  { id: '7501011115893', name: 'Papas Sabritas Original 45g', category: 'Botanas', price: 22.00, cost: 15.00, stock: 15, minStock: 4 },
  { id: '7501000111223', name: 'Pan Dulce Bimbo Conchas 2pzs', category: 'Panadería', price: 25.50, cost: 18.00, stock: 8, minStock: 3 },
  { id: '7501020512249', name: 'Leche Lala Entera Ultra 1L', category: 'Lácteos', price: 27.00, cost: 21.00, stock: 4, minStock: 5 },
  { id: '7501030456123', name: 'Aceite Vegetal Nutrioli 900ml', category: 'Abarrotes', price: 42.00, cost: 32.00, stock: 12, minStock: 4 },
  { id: '7501040789012', name: 'Detergente en Polvo Roma 1kg', category: 'Limpieza', price: 38.50, cost: 28.50, stock: 0, minStock: 3 },
  { id: '7501050123456', name: 'Jugo Valle Naranja 1L', category: 'Bebidas', price: 24.00, cost: 17.50, stock: 18, minStock: 5 },
  { id: '7501060987654', name: 'Galletas Chokis Gamesa 57g', category: 'Botanas', price: 19.50, cost: 13.50, stock: 30, minStock: 6 }
];

const DEFAULT_SALES: Sale[] = [
  {
    id: 'VTA-823901',
    date: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    items: [
      { productId: '7501055300018', name: 'Refresco de Cola 600ml', quantity: 2, price: 18.00 },
      { productId: '7501011115893', name: 'Papas Sabritas Original 45g', quantity: 1, price: 22.00 }
    ],
    total: 58.00,
    paymentMethod: 'cash',
    cashReceived: 100.00,
    change: 42.00
  },
  {
    id: 'VTA-129031',
    date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    items: [
      { productId: '7501020512249', name: 'Leche Lala Entera Ultra 1L', quantity: 2, price: 27.00 },
      { productId: '7501030456123', name: 'Aceite Vegetal Nutrioli 900ml', quantity: 1, price: 42.00 }
    ],
    total: 96.00,
    paymentMethod: 'card'
  }
];

function App() {
  const [activeView, setActiveView] = useState<'landing' | 'pos' | 'inventory' | 'sales'>('landing');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Load from localStorage or seed with defaults
  useEffect(() => {
    const storedProducts = localStorage.getItem('lichita_products');
    const storedSales = localStorage.getItem('lichita_sales');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('lichita_products', JSON.stringify(DEFAULT_PRODUCTS));
    }

    if (storedSales) {
      setSales(JSON.parse(storedSales));
    } else {
      setSales(DEFAULT_SALES);
      localStorage.setItem('lichita_sales', JSON.stringify(DEFAULT_SALES));
    }
  }, []);

  // Handlers for products
  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem('lichita_products', JSON.stringify(updated));
  };

  const handleEditProduct = (editedProduct: Product) => {
    const updated = products.map(p => p.id === editedProduct.id ? editedProduct : p);
    setProducts(updated);
    localStorage.setItem('lichita_products', JSON.stringify(updated));
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    localStorage.setItem('lichita_products', JSON.stringify(updated));
  };

  const handleUpdateStocks = (itemsSold: { id: string; quantitySold: number }[]) => {
    const updated = products.map(p => {
      const match = itemsSold.find(item => item.id === p.id);
      if (match) {
        return {
          ...p,
          stock: Math.max(0, p.stock - match.quantitySold)
        };
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem('lichita_products', JSON.stringify(updated));
  };

  // Handlers for sales
  const handleAddSale = (newSale: Sale) => {
    const updated = [newSale, ...sales];
    setSales(updated);
    localStorage.setItem('lichita_sales', JSON.stringify(updated));
  };

  return (
    <div className="app-container">
      {/* Header / Navbar */}
      <header className="app-header">
        <div className="app-logo" onClick={() => setActiveView('landing')}>
          <Store size={26} style={{ color: 'var(--primary)' }} />
          <span>Miscelánea <span>Lichita</span></span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-btn ${activeView === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveView('landing')}
          >
            <Home size={18} />
            <span className="hide-on-mobile">Inicio</span>
          </button>
          
          <button 
            className={`nav-btn ${activeView === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveView('pos')}
          >
            <ShoppingBag size={18} />
            <span>Cobrar (POS)</span>
          </button>

          <button 
            className={`nav-btn ${activeView === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveView('inventory')}
          >
            <PackageOpen size={18} />
            <span>Inventario</span>
          </button>

          <button 
            className={`nav-btn ${activeView === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveView('sales')}
          >
            <History size={18} />
            <span>Ventas</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeView === 'landing' && (
          <LandingPage onEnterApp={() => setActiveView('pos')} />
        )}
        {activeView === 'pos' && (
          <POSView 
            products={products} 
            onAddSale={handleAddSale}
            onUpdateStocks={handleUpdateStocks}
          />
        )}
        {activeView === 'inventory' && (
          <InventoryView 
            products={products} 
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {activeView === 'sales' && (
          <SalesHistoryView 
            sales={sales} 
            products={products}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          &copy; {new Date().getFullYear()} Miscelánea Lichita - Sistema de Control Inteligente
        </div>
        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          Desarrollado con React + TypeScript + CSS Moderno | Soporte: <a href="mailto:soporte@lichita.com">soporte@lichita.com</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
