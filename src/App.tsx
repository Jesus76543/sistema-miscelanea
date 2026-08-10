import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  PackageOpen, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Store, 
  Volume2, 
  VolumeX, 
  Clock, 
  Sun, 
  Moon, 
  Sparkles, 
  Flame 
} from 'lucide-react';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { FiadosView } from './components/FiadosView';
import { CashControlView } from './components/CashControlView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { soundManager } from './utils/audio';

import type { 
  Product, 
  Sale, 
  CustomerAccount, 
  CashMovement, 
  StoreSettings 
} from './data/initialProducts';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_CASH_MOVEMENTS, 
  INITIAL_SALES, 
  INITIAL_SETTINGS 
} from './data/initialProducts';

import './index.css';

type ActiveView = 'pos' | 'inventory' | 'fiados' | 'cash' | 'reports' | 'settings';
export type AppTheme = 'luxe' | 'light' | 'cyber' | 'sunset';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('pos');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<AppTheme>('luxe');

  // Global Business State
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme synchronization with document
  useEffect(() => {
    const savedTheme = (localStorage.getItem('lichita_theme') as AppTheme) || 'luxe';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lichita_theme', newTheme);
  };

  // Initialize and Seed from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem('lichita_products_v2');
    const storedSales = localStorage.getItem('lichita_sales_v2');
    const storedCustomers = localStorage.getItem('lichita_customers_v2');
    const storedCash = localStorage.getItem('lichita_cash_v2');
    const storedSettings = localStorage.getItem('lichita_settings_v2');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('lichita_products_v2', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (storedSales) {
      setSales(JSON.parse(storedSales));
    } else {
      setSales(INITIAL_SALES);
      localStorage.setItem('lichita_sales_v2', JSON.stringify(INITIAL_SALES));
    }

    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    } else {
      setCustomers(INITIAL_CUSTOMERS);
      localStorage.setItem('lichita_customers_v2', JSON.stringify(INITIAL_CUSTOMERS));
    }

    if (storedCash) {
      setCashMovements(JSON.parse(storedCash));
    } else {
      setCashMovements(INITIAL_CASH_MOVEMENTS);
      localStorage.setItem('lichita_cash_v2', JSON.stringify(INITIAL_CASH_MOVEMENTS));
    }

    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setSettings(parsed);
      soundManager.setEnabled(parsed.soundEnabled ?? true);
    } else {
      setSettings(INITIAL_SETTINGS);
      localStorage.setItem('lichita_settings_v2', JSON.stringify(INITIAL_SETTINGS));
    }
  }, []);

  // Handlers: Products
  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem('lichita_products_v2', JSON.stringify(updated));
  };

  const handleEditProduct = (editedProduct: Product) => {
    const updated = products.map(p => p.id === editedProduct.id ? editedProduct : p);
    setProducts(updated);
    localStorage.setItem('lichita_products_v2', JSON.stringify(updated));
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    localStorage.setItem('lichita_products_v2', JSON.stringify(updated));
  };

  const handleQuickUpdateStock = (id: string, delta: number) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem('lichita_products_v2', JSON.stringify(updated));
    soundManager.playScanBeep();
  };

  const handleUpdateStocks = (itemsSold: { id: string; quantitySold: number }[]) => {
    const updated = products.map(p => {
      const match = itemsSold.find(item => item.id === p.id);
      if (match) {
        return { ...p, stock: Math.max(0, p.stock - match.quantitySold) };
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem('lichita_products_v2', JSON.stringify(updated));
  };

  // Handlers: Sales
  const handleAddSale = (newSale: Sale) => {
    const updated = [newSale, ...sales];
    setSales(updated);
    localStorage.setItem('lichita_sales_v2', JSON.stringify(updated));
  };

  // Handlers: Fiados
  const handleAddCustomer = (customer: CustomerAccount) => {
    const updated = [customer, ...customers];
    setCustomers(updated);
    localStorage.setItem('lichita_customers_v2', JSON.stringify(updated));
  };

  const handleUpdateCustomer = (customer: CustomerAccount) => {
    const updated = customers.map(c => c.id === customer.id ? customer : c);
    setCustomers(updated);
    localStorage.setItem('lichita_customers_v2', JSON.stringify(updated));
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    localStorage.setItem('lichita_customers_v2', JSON.stringify(updated));
  };

  const handleChargeToFiadoCustomer = (customerId: string, amount: number, note: string) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const newMovement = {
          id: 'CAR-' + Date.now(),
          date: new Date().toISOString(),
          type: 'charge' as const,
          amount,
          note
        };
        return {
          ...c,
          currentDebt: c.currentDebt + amount,
          history: [newMovement, ...c.history]
        };
      }
      return c;
    });
    setCustomers(updated);
    localStorage.setItem('lichita_customers_v2', JSON.stringify(updated));
  };

  // Handlers: Cash Movements
  const handleAddCashMovement = (movement: CashMovement) => {
    const updated = [movement, ...cashMovements];
    setCashMovements(updated);
    localStorage.setItem('lichita_cash_v2', JSON.stringify(updated));
  };

  // Handlers: Settings & Restore
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem('lichita_settings_v2', JSON.stringify(newSettings));
  };

  const handleRestoreAllData = (data: {
    products: Product[];
    sales: Sale[];
    customers: CustomerAccount[];
    cashMovements: CashMovement[];
    settings: StoreSettings;
  }) => {
    setProducts(data.products);
    setSales(data.sales);
    setCustomers(data.customers);
    setCashMovements(data.cashMovements);
    setSettings(data.settings);

    localStorage.setItem('lichita_products_v2', JSON.stringify(data.products));
    localStorage.setItem('lichita_sales_v2', JSON.stringify(data.sales));
    localStorage.setItem('lichita_customers_v2', JSON.stringify(data.customers));
    localStorage.setItem('lichita_cash_v2', JSON.stringify(data.cashMovements));
    localStorage.setItem('lichita_settings_v2', JSON.stringify(data.settings));
  };

  const toggleSound = () => {
    const nextSound = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: nextSound };
    setSettings(newSettings);
    soundManager.setEnabled(nextSound);
    localStorage.setItem('lichita_settings_v2', JSON.stringify(newSettings));
    if (nextSound) soundManager.playScanBeep();
  };

  // Debt badge count
  const activeDebtorsCount = customers.filter(c => c.currentDebt > 0).length;

  return (
    <div className="app-container">
      {/* Top Application Bar */}
      <header className="app-header">
        <div className="app-logo" onClick={() => setActiveView('pos')}>
          <Store size={26} style={{ color: 'var(--primary)' }} />
          <span>{settings.storeName.split(' ')[0]} <span>{settings.storeName.split(' ').slice(1).join(' ') || 'POS'}</span></span>
        </div>

        {/* Center Live Clock & Status */}
        <div className="header-center-info">
          <div className="live-badge">
            <span className="live-dot"></span>
            <span>Caja Abierta</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <Clock size={15} style={{ color: 'var(--primary)' }} />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Navigation Tabs & Theme Switcher */}
        <nav className="nav-links">
          <button 
            className={`nav-btn ${activeView === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveView('pos')}
          >
            <ShoppingBag size={18} />
            <span>Caja (POS)</span>
          </button>

          <button 
            className={`nav-btn ${activeView === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveView('inventory')}
          >
            <PackageOpen size={18} />
            <span>Inventario ({products.length})</span>
          </button>

          <button 
            className={`nav-btn ${activeView === 'fiados' ? 'active' : ''}`}
            onClick={() => setActiveView('fiados')}
          >
            <BookOpen size={18} />
            <span>Fiados</span>
            {activeDebtorsCount > 0 && (
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '50px', background: 'var(--accent)', color: '#000', fontWeight: 800 }}>
                {activeDebtorsCount}
              </span>
            )}
          </button>

          <button 
            className={`nav-btn ${activeView === 'cash' ? 'active' : ''}`}
            onClick={() => setActiveView('cash')}
          >
            <DollarSign size={18} />
            <span>Caja & Gastos</span>
          </button>

          <button 
            className={`nav-btn ${activeView === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveView('reports')}
          >
            <TrendingUp size={18} />
            <span>Reportes</span>
          </button>

          <button 
            className={`nav-btn ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <Settings size={18} />
            <span>Ajustes</span>
          </button>

          {/* Theme Quick Selector */}
          <div className="theme-selector" title="Cambiar Tema Visual">
            <button 
              className={`theme-pill-btn ${theme === 'luxe' ? 'active' : ''}`} 
              onClick={() => handleThemeChange('luxe')}
              title="Tema Luxe Obsidian"
            >
              <Moon size={14} />
            </button>
            <button 
              className={`theme-pill-btn ${theme === 'light' ? 'active' : ''}`} 
              onClick={() => handleThemeChange('light')}
              title="Tema Claro Minimalista"
            >
              <Sun size={14} />
            </button>
            <button 
              className={`theme-pill-btn ${theme === 'cyber' ? 'active' : ''}`} 
              onClick={() => handleThemeChange('cyber')}
              title="Tema Cyberpunk Violeta"
            >
              <Sparkles size={14} />
            </button>
            <button 
              className={`theme-pill-btn ${theme === 'sunset' ? 'active' : ''}`} 
              onClick={() => handleThemeChange('sunset')}
              title="Tema Sunset Cálido"
            >
              <Flame size={14} />
            </button>
          </div>

          <button 
            className="icon-btn" 
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Desactivar Sonido' : 'Activar Sonido'}
            style={{ marginLeft: '0.25rem' }}
          >
            {settings.soundEnabled ? <Volume2 size={18} style={{ color: 'var(--primary)' }} /> : <VolumeX size={18} />}
          </button>
        </nav>
      </header>

      {/* Main View Router */}
      <main className="main-content">
        {activeView === 'pos' && (
          <POSView 
            products={products} 
            customers={customers}
            settings={settings}
            onAddSale={handleAddSale}
            onUpdateStocks={handleUpdateStocks}
            onChargeToFiadoCustomer={handleChargeToFiadoCustomer}
          />
        )}

        {activeView === 'inventory' && (
          <InventoryView 
            products={products} 
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onQuickUpdateStock={handleQuickUpdateStock}
          />
        )}

        {activeView === 'fiados' && (
          <FiadosView 
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}

        {activeView === 'cash' && (
          <CashControlView 
            cashMovements={cashMovements}
            sales={sales}
            settings={settings}
            onAddCashMovement={handleAddCashMovement}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView 
            sales={sales}
            products={products}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView 
            settings={settings}
            products={products}
            sales={sales}
            customers={customers}
            cashMovements={cashMovements}
            currentTheme={theme}
            onThemeChange={handleThemeChange}
            onSaveSettings={handleSaveSettings}
            onRestoreAllData={handleRestoreAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <b>{settings.storeName}</b> — Sistema de Punto de Venta y Control de Inventario
        </div>
        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Atajos rápidos: <b>F2</b> Buscar Producto | <b>F4</b> Cobrar | <b>F7</b> Nuevo Ticket | <b>Esc</b> Cerrar
        </div>
      </footer>
    </div>
  );
}

export default App;
