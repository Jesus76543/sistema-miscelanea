import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Wallet, 
  ReceiptText, 
  AlertTriangle, 
  ShoppingBasket, 
  Check,
  X
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export interface Sale {
  id: string;
  date: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  paymentMethod: 'cash' | 'card';
  cashReceived?: number;
  change?: number;
}

interface POSViewProps {
  products: Product[];
  onAddSale: (sale: Sale) => void;
  onUpdateStocks: (items: { id: string; quantitySold: number }[]) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const POSView: React.FC<POSViewProps> = ({ products, onAddSale, onUpdateStocks }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showError(`¡"${product.name}" no tiene stock disponible!`);
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        if (currentQty >= product.stock) {
          showError(`No puedes agregar más de ${product.stock} unidades de "${product.name}" (stock máximo alcanzado).`);
          return prevCart;
        }
        
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: currentQty + 1
        };
        return newCart;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  // Adjust item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          
          // Check stock
          if (newQty > item.product.stock) {
            showError(`Solo hay ${item.product.stock} unidades en existencia para "${item.product.name}".`);
            return item;
          }
          
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  // Remove item
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Show error toast
  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null);
    }, 4000);
  };

  // Math totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => subtotal * 0.16, [subtotal]); // 16% IVA
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const handleCheckoutOpen = () => {
    if (cart.length === 0) return;
    setCheckoutError(null);
    setCashReceived('');
    setReceiptSale(null);
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const numericTotal = total;
    let numericCash = 0;
    let calculatedChange = 0;

    if (paymentMethod === 'cash') {
      numericCash = parseFloat(cashReceived);
      if (isNaN(numericCash) || numericCash < numericTotal) {
        setCheckoutError(`El efectivo recibido debe ser al menos de $${numericTotal.toFixed(2)}`);
        return;
      }
      calculatedChange = numericCash - numericTotal;
    }

    // Prepare Sale Object
    const newSale: Sale = {
      id: 'VTA-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: numericTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? numericCash : undefined,
      change: paymentMethod === 'cash' ? calculatedChange : undefined
    };

    // Update global stock
    const stockUpdates = cart.map(item => ({
      id: item.product.id,
      quantitySold: item.quantity
    }));
    
    onUpdateStocks(stockUpdates);
    onAddSale(newSale);
    setReceiptSale(newSale); // Triggers ticket view
  };

  const handleResetSale = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setReceiptSale(null);
  };

  return (
    <div className="pos-layout animate-fade-in">
      {/* Product Catalog Side */}
      <div className="pos-main">
        {/* Search & Alerts */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código de barras..."
              className="input-styled"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <button 
              className="btn-secondary" 
              onClick={() => setSearchQuery('')}
              style={{ padding: '0 1.25rem' }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="glass animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderLeft: '4px solid var(--danger)', borderRadius: 'var(--radius-sm)', background: 'var(--danger-glow)', color: '#fecaca' }}>
            <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{errorMessage}</span>
          </div>
        )}

        {/* Categories Tabs */}
        <div className="categories-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'Todos' ? '📂 Todos' : cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="glass empty-state" style={{ borderRadius: 'var(--radius-lg)' }}>
            <ShoppingBasket size={48} />
            <h3>No se encontraron productos</h3>
            <p>Intenta buscar con otros términos o cambia la categoría filtrada.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const inCartItem = cart.find(item => item.product.id === product.id);
              const remainingStock = product.stock - (inCartItem ? inCartItem.quantity : 0);
              const isLowStock = remainingStock <= product.minStock;

              return (
                <div 
                  key={product.id} 
                  className="glass glass-hover product-card"
                  onClick={() => addToCart(product)}
                >
                  <div className="product-card-top">
                    <span className="product-tag">{product.category}</span>
                    <span className={`product-stock ${remainingStock <= 0 ? 'stock-low' : (isLowStock ? 'stock-low' : 'stock-ok')}`}>
                      {remainingStock <= 0 ? 'Agotado' : `Stock: ${remainingStock}`}
                    </span>
                  </div>
                  
                  <div className="product-name">{product.name}</div>
                  
                  <div className="product-card-bottom">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <button className="btn-add-mini" onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      <div className="glass pos-sidebar" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <div className="pos-sidebar-title">
          <ShoppingBasket size={22} className="gradient-text-accent" />
          <span>Carrito de Compra</span>
          {cart.length > 0 && (
            <span style={{ fontSize: '0.8rem', background: 'var(--secondary-glow)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '50px', marginLeft: 'auto' }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} arts
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingBasket size={48} style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem' }}>El carrito está vacío.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Haz clic en un producto para agregarlo.</p>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.product.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.product.name}</span>
                    <span className="cart-item-price-each">${item.product.price.toFixed(2)} c/u</span>
                  </div>
                  <div className="cart-item-actions">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button className="qty-btn" onClick={() => updateQuantity(item.product.id, -1)}>
                        <Minus size={12} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.product.id, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="cart-item-total">${(item.product.price * item.quantity).toFixed(2)}</span>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-total-row">
                <span>IVA (16%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cart-total-row grand-total">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleCheckoutOpen} 
                className="btn-primary btn-checkout-action"
              >
                <Wallet size={18} />
                <span>Proceder al Cobro</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ background: '#111827', border: '1px solid var(--border-color)' }}>
            
            {/* Close Button (only active if receipt is not showing) */}
            {!receiptSale && (
              <button 
                className="icon-btn" 
                onClick={() => setIsCheckoutOpen(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            )}

            {!receiptSale ? (
              // Payment Input Form
              <form onSubmit={handleProcessPayment}>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wallet size={24} style={{ color: 'var(--primary)' }} />
                  <span>Procesar Pago</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: paymentMethod === 'cash' ? 'var(--primary)' : 'var(--border-color)', background: paymentMethod === 'cash' ? 'var(--primary-glow)' : 'transparent' }}
                  >
                    <Wallet size={18} />
                    <span>Efectivo</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: paymentMethod === 'card' ? 'var(--secondary)' : 'var(--border-color)', background: paymentMethod === 'card' ? 'var(--secondary-glow)' : 'transparent' }}
                  >
                    <CreditCard size={18} />
                    <span>Tarjeta</span>
                  </button>
                </div>

                <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto a Cobrar</span>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ${total.toFixed(2)}
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" htmlFor="cash-input">Efectivo Recibido</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>$</span>
                      <input
                        id="cash-input"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="input-styled"
                        style={{ paddingLeft: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    {cashReceived && parseFloat(cashReceived) >= total && (
                      <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: '0.95rem', color: 'var(--primary)', fontWeight: '600' }}>
                        Cambio: ${(parseFloat(cashReceived) - total).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {checkoutError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={16} />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <div className="modal-footer-btns">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    <Check size={18} />
                    <span>Cobrar</span>
                  </button>
                </div>
              </form>
            ) : (
              // Print Ticket Screen
              <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <Check size={28} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>¡Pago Exitoso!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  El inventario se ha actualizado de forma local.
                </p>

                {/* Printable Digital Receipt */}
                <div className="ticket-wrapper">
                  <div className="ticket-header">
                    <div className="ticket-store-name">MISCELÁNEA LICHITA</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>CALLE PRINCIPAL #456, COL. CENTRO</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>TEL: 123-456-7890</div>
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    <div><b>TICKET:</b> {receiptSale.id}</div>
                    <div><b>FECHA:</b> {new Date(receiptSale.date).toLocaleString()}</div>
                    <div><b>METODO:</b> {receiptSale.paymentMethod === 'cash' ? 'EFECTIVO' : 'TARJETA'}</div>
                  </div>

                  <div className="ticket-divider"></div>

                  <div style={{ fontSize: '0.8rem' }}>
                    {receiptSale.items.map((item, idx) => (
                      <div key={idx} className="ticket-item-row">
                        <div>
                          <div>{item.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                            {item.quantity} x ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <div>${(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="ticket-divider"></div>

                  <div className="ticket-total-row" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                    <span>SUBTOTAL:</span>
                    <span>${(receiptSale.total / 1.16).toFixed(2)}</span>
                  </div>
                  <div className="ticket-total-row" style={{ fontSize: '0.8rem', fontWeight: 'normal', marginBottom: '0.25rem' }}>
                    <span>IVA (16%):</span>
                    <span>${(receiptSale.total - (receiptSale.total / 1.16)).toFixed(2)}</span>
                  </div>
                  <div className="ticket-total-row">
                    <span>TOTAL:</span>
                    <span>${receiptSale.total.toFixed(2)}</span>
                  </div>

                  {receiptSale.paymentMethod === 'cash' && (
                    <>
                      <div className="ticket-total-row" style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.25rem' }}>
                        <span>PAGÓ CON:</span>
                        <span>${receiptSale.cashReceived?.toFixed(2)}</span>
                      </div>
                      <div className="ticket-total-row" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                        <span>CAMBIO:</span>
                        <span>${receiptSale.change?.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="ticket-footer">
                    <div>*** GRACIAS POR SU COMPRA ***</div>
                    <div style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>SISTEMA DIGITAL LICHITA</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button 
                    className="btn-secondary"
                    onClick={() => alert('Simulando impresión de ticket... Enlazando a impresora térmica POS.')}
                  >
                    <ReceiptText size={18} />
                    <span>Imprimir</span>
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleResetSale}
                  >
                    <span>Nueva Venta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
