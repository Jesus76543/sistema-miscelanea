import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Wallet, 
  AlertTriangle, 
  ShoppingBasket, 
  Check, 
  X, 
  Printer, 
  PlusCircle, 
  BookOpen, 
  QrCode, 
  Barcode 
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import type { Product, Sale, CustomerAccount, StoreSettings } from '../data/initialProducts';

interface POSViewProps {
  products: Product[];
  customers: CustomerAccount[];
  settings: StoreSettings;
  onAddSale: (sale: Sale) => void;
  onUpdateStocks: (items: { id: string; quantitySold: number }[]) => void;
  onChargeToFiadoCustomer?: (customerId: string, amount: number, note: string) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface TicketTab {
  id: string;
  name: string;
  items: CartItem[];
  discount: number;
}

export const POSView: React.FC<POSViewProps> = ({ 
  products, 
  customers, 
  settings, 
  onAddSale, 
  onUpdateStocks,
  onChargeToFiadoCustomer 
}) => {
  // Multi-ticket state
  const [tickets, setTickets] = useState<TicketTab[]>([
    { id: 'T-1', name: 'Ticket 1', items: [], discount: 0 }
  ]);
  const [activeTicketId, setActiveTicketId] = useState<string>('T-1');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'fiado'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // Active Ticket helper
  const activeTicket = useMemo(() => {
    return tickets.find(t => t.id === activeTicketId) || tickets[0];
  }, [tickets, activeTicketId]);

  const cart = activeTicket.items;

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

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          handleOpenCheckout();
        }
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleCreateNewTicket();
      } else if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Multi-ticket operations
  const handleCreateNewTicket = () => {
    const newId = 'T-' + (tickets.length + 1);
    const newTicket: TicketTab = {
      id: newId,
      name: `Ticket ${tickets.length + 1}`,
      items: [],
      discount: 0
    };
    setTickets([...tickets, newTicket]);
    setActiveTicketId(newId);
    soundManager.playHoldTone();
  };

  const handleCloseTicket = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tickets.length === 1) {
      // Just clear items
      setTickets([{ ...tickets[0], items: [], discount: 0 }]);
      return;
    }

    const nextTickets = tickets.filter(t => t.id !== ticketId);
    setTickets(nextTickets);
    if (activeTicketId === ticketId) {
      setActiveTicketId(nextTickets[0].id);
    }
  };

  // Add product to cart with Stock Check & Audio feedback
  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.stock <= 0) {
      showError(`¡"${product.name}" no tiene existencias!`);
      soundManager.playError();
      return;
    }

    setTickets(prevTickets => {
      return prevTickets.map(t => {
        if (t.id === activeTicketId) {
          const existingIndex = t.items.findIndex(item => item.product.id === product.id);
          
          if (existingIndex > -1) {
            const currentQty = t.items[existingIndex].quantity;
            if (currentQty + quantityToAdd > product.stock) {
              showError(`Stock máximo alcanzado (${product.stock} u.) para "${product.name}".`);
              soundManager.playError();
              return t;
            }

            const updatedItems = [...t.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: currentQty + quantityToAdd
            };
            return { ...t, items: updatedItems };
          } else {
            return { ...t, items: [...t.items, { product, quantity: quantityToAdd }] };
          }
        }
        return t;
      });
    });

    soundManager.playScanBeep();
  };

  // Barcode / Fast Input Scanner Handler
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchQuery.trim();
      if (!query) return;

      // Check exact barcode match first
      const exactProduct = products.find(p => p.id === query || p.name.toLowerCase() === query.toLowerCase());
      if (exactProduct) {
        addToCart(exactProduct);
        setSearchQuery('');
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchQuery('');
      } else if (filteredProducts.length === 0) {
        showError(`No se encontró producto con código "${query}".`);
        soundManager.playError();
      }
    }
  };

  // Adjust item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setTickets(prevTickets => {
      return prevTickets.map(t => {
        if (t.id === activeTicketId) {
          const updatedItems = t.items.map(item => {
            if (item.product.id === productId) {
              const newQty = item.quantity + delta;
              if (newQty <= 0) return null;
              if (newQty > item.product.stock) {
                showError(`Solo hay ${item.product.stock} unidades en existencia.`);
                soundManager.playError();
                return item;
              }
              return { ...item, quantity: newQty };
            }
            return item;
          }).filter((item): item is CartItem => item !== null);

          return { ...t, items: updatedItems };
        }
        return t;
      });
    });
  };

  // Remove single item
  const removeFromCart = (productId: string) => {
    setTickets(prevTickets => {
      return prevTickets.map(t => {
        if (t.id === activeTicketId) {
          return { ...t, items: t.items.filter(item => item.product.id !== productId) };
        }
        return t;
      });
    });
  };

  // Clear current ticket
  const handleClearCurrentTicket = () => {
    setTickets(prevTickets => {
      return prevTickets.map(t => {
        if (t.id === activeTicketId) {
          return { ...t, items: [], discount: 0 };
        }
        return t;
      });
    });
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 3500);
  };

  // Math totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const tax = useMemo(() => {
    return settings.enableTax ? subtotal * settings.taxRate : 0;
  }, [subtotal, settings.enableTax, settings.taxRate]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + tax - activeTicket.discount);
  }, [subtotal, tax, activeTicket.discount]);

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setReceiptSale(null);
    setPaymentMethod('cash');
    setCashReceived(total.toString());
    setSelectedCustomerId(customers[0]?.id || '');
    setIsCheckoutOpen(true);
  };

  // Quick Bills helper
  const handleSetCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  // Complete Payment & Process Sale
  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();

    const numericTotal = total;
    let numericCash = 0;
    let calculatedChange = 0;

    if (paymentMethod === 'cash') {
      numericCash = parseFloat(cashReceived);
      if (isNaN(numericCash) || numericCash < numericTotal) {
        showError(`El efectivo ingresado ($${numericCash || 0}) es menor al total ($${numericTotal.toFixed(2)}).`);
        soundManager.playError();
        return;
      }
      calculatedChange = numericCash - numericTotal;
    }

    const customerObj = customers.find(c => c.id === selectedCustomerId);

    // Prepare Sale Record
    const newSale: Sale = {
      id: 'TKT-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        cost: item.product.cost
      })),
      subtotal,
      tax,
      discount: activeTicket.discount,
      total: numericTotal,
      paymentMethod,
      customerName: paymentMethod === 'fiado' ? customerObj?.name : undefined,
      customerId: paymentMethod === 'fiado' ? selectedCustomerId : undefined,
      cashReceived: paymentMethod === 'cash' ? numericCash : undefined,
      change: paymentMethod === 'cash' ? calculatedChange : undefined
    };

    // If fiado, update customer account
    if (paymentMethod === 'fiado' && customerObj && onChargeToFiadoCustomer) {
      const itemsSummary = cart.map(i => `${i.product.name} (${i.quantity})`).join(', ');
      onChargeToFiadoCustomer(customerObj.id, numericTotal, `Compra en caja: ${itemsSummary}`);
    }

    // Update global stock
    const stockUpdates = cart.map(item => ({
      id: item.product.id,
      quantitySold: item.quantity
    }));
    
    onUpdateStocks(stockUpdates);
    onAddSale(newSale);
    setReceiptSale(newSale);
    soundManager.playCashRegister();
  };

  const handleResetAfterSale = () => {
    handleClearCurrentTicket();
    setIsCheckoutOpen(false);
    setReceiptSale(null);
  };

  return (
    <div className="pos-layout animate-fade-in">
      {/* Product Catalog Side */}
      <div className="pos-main">
        
        {/* Multi-Ticket Bar */}
        <div className="glass" style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="ticket-tabs-bar">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                className={`ticket-tab ${activeTicketId === ticket.id ? 'active' : ''}`}
                onClick={() => setActiveTicketId(ticket.id)}
              >
                <span>{ticket.name}</span>
                {ticket.items.length > 0 && (
                  <span className="badge-count">{ticket.items.reduce((s, i) => s + i.quantity, 0)}</span>
                )}
                {tickets.length > 1 && (
                  <X 
                    size={14} 
                    style={{ opacity: 0.7, marginLeft: '0.25rem' }} 
                    onClick={(e) => handleCloseTicket(ticket.id, e)} 
                  />
                )}
              </button>
            ))}

            <button className="btn-new-ticket" onClick={handleCreateNewTicket}>
              <PlusCircle size={14} />
              <span>Nuevo Ticket (F7)</span>
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
            <span><b>F2</b>: Buscar</span>
            <span><b>F4</b>: Cobrar</span>
            <span><b>F7</b>: Ticket</span>
          </div>
        </div>

        {/* Barcode & Search Input */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="search-input-wrapper">
            <Barcode className="search-icon" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Escanea con pistola de código de barras o escribe el nombre del producto (Presiona Enter)..."
              className="input-styled"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />
          </div>
          {searchQuery && (
            <button 
              className="btn-secondary" 
              onClick={() => setSearchQuery('')}
              style={{ padding: '0 1rem' }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="glass animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', borderLeft: '4px solid var(--danger)', borderRadius: 'var(--radius-sm)', background: 'var(--danger-glow)', color: '#fecaca' }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{errorMessage}</span>
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
              {cat === 'Todos' ? '📂 Todos los Productos' : cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="glass empty-state" style={{ borderRadius: 'var(--radius-lg)' }}>
            <ShoppingBasket size={44} />
            <h3>No se encontraron productos</h3>
            <p>Intenta buscar por código o nombre.</p>
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
                    <span className="product-emoji">{product.emoji || '📦'}</span>
                    <span className={`product-stock ${remainingStock <= 0 ? 'stock-low' : (isLowStock ? 'stock-low' : 'stock-ok')}`}>
                      {remainingStock <= 0 ? 'Agotado' : `${remainingStock} ${product.unit}`}
                    </span>
                  </div>
                  
                  <div className="product-name">{product.name}</div>
                  
                  <div className="product-card-bottom">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <button 
                      className="btn-add-mini"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
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
      <div className="glass pos-sidebar" style={{ borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <div className="pos-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem' }}>
            <ShoppingBasket size={22} className="gradient-text-accent" />
            <span>{activeTicket.name}</span>
          </div>

          {cart.length > 0 && (
            <button 
              className="icon-btn" 
              title="Vaciar ticket actual"
              onClick={handleClearCurrentTicket}
              style={{ color: 'var(--text-muted)' }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingBasket size={44} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>El carrito está vacío</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Haz clic en un producto o escanéalo con código de barras.</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
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
                      <Trash2 size={15} />
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
              {settings.enableTax && (
                <div className="cart-total-row">
                  <span>IVA ({(settings.taxRate * 100).toFixed(0)}%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              )}
              {activeTicket.discount > 0 && (
                <div className="cart-total-row" style={{ color: 'var(--primary)' }}>
                  <span>Descuento:</span>
                  <span>-${activeTicket.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="cart-total-row grand-total">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleOpenCheckout} 
                className="btn-primary"
                style={{ width: '100%', marginTop: '0.85rem', padding: '0.85rem', fontSize: '1.1rem' }}
              >
                <Wallet size={20} />
                <span>Cobrar (F4)</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Payment Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            
            {!receiptSale && (
              <button 
                className="icon-btn" 
                onClick={() => setIsCheckoutOpen(false)}
                style={{ position: 'absolute', top: '1rem', right: '1rem' }}
              >
                <X size={18} />
              </button>
            )}

            {!receiptSale ? (
              <form onSubmit={handleCompletePayment}>
                <h3 className="modal-title" style={{ color: 'var(--primary)' }}>
                  <Wallet size={24} />
                  <span>Cobrar Venta</span>
                </h3>

                {/* Payment Methods */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                    style={{ padding: '0.6rem 0.2rem', flexDirection: 'column', fontSize: '0.75rem', borderColor: paymentMethod === 'cash' ? 'var(--primary)' : undefined, background: paymentMethod === 'cash' ? 'var(--primary-glow)' : undefined }}
                  >
                    <Wallet size={16} />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-secondary ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                    style={{ padding: '0.6rem 0.2rem', flexDirection: 'column', fontSize: '0.75rem', borderColor: paymentMethod === 'card' ? 'var(--secondary)' : undefined, background: paymentMethod === 'card' ? 'var(--secondary-glow)' : undefined }}
                  >
                    <CreditCard size={16} />
                    <span>Tarjeta</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-secondary ${paymentMethod === 'transfer' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('transfer')}
                    style={{ padding: '0.6rem 0.2rem', flexDirection: 'column', fontSize: '0.75rem', borderColor: paymentMethod === 'transfer' ? 'var(--info)' : undefined, background: paymentMethod === 'transfer' ? 'var(--info-glow)' : undefined }}
                  >
                    <QrCode size={16} />
                    <span>SPEI / CoDi</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-secondary ${paymentMethod === 'fiado' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('fiado')}
                    style={{ padding: '0.6rem 0.2rem', flexDirection: 'column', fontSize: '0.75rem', borderColor: paymentMethod === 'fiado' ? 'var(--accent)' : undefined, background: paymentMethod === 'fiado' ? 'var(--accent-glow)' : undefined }}
                  >
                    <BookOpen size={16} />
                    <span>Fiado</span>
                  </button>
                </div>

                {/* Total Big Display */}
                <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monto a Cobrar</span>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1 }}>
                    ${total.toFixed(2)}
                  </div>
                </div>

                {/* Cash Options */}
                {paymentMethod === 'cash' && (
                  <div>
                    <label className="form-label">Efectivo Recibido ($)</label>
                    <input
                      type="number"
                      step="0.50"
                      className="input-styled"
                      style={{ fontSize: '1.25rem', fontWeight: 800 }}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      required
                      autoFocus
                    />

                    {/* Quick Bill helper buttons */}
                    <div className="bills-grid">
                      <button type="button" className="bill-btn exact" onClick={() => handleSetCash(total)}>
                        Exacto
                      </button>
                      <button type="button" className="bill-btn" onClick={() => handleSetCash(20)}>
                        $20
                      </button>
                      <button type="button" className="bill-btn" onClick={() => handleSetCash(50)}>
                        $50
                      </button>
                      <button type="button" className="bill-btn" onClick={() => handleSetCash(100)}>
                        $100
                      </button>
                      <button type="button" className="bill-btn" onClick={() => handleSetCash(200)}>
                        $200
                      </button>
                      <button type="button" className="bill-btn" onClick={() => handleSetCash(500)}>
                        $500
                      </button>
                      <button type="button" className="bill-btn" onClick={() => handleSetCash(1000)}>
                        $1000
                      </button>
                      <button 
                        type="button" 
                        className="bill-btn" 
                        onClick={() => {
                          const rounded = Math.ceil(total / 50) * 50;
                          handleSetCash(rounded);
                        }}
                      >
                        Próx $50
                      </button>
                    </div>

                    {cashReceived && parseFloat(cashReceived) >= total && (
                      <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                        Cambio: ${(parseFloat(cashReceived) - total).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {/* Fiado Customer Selector */}
                {paymentMethod === 'fiado' && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Selecciona el Cliente de la Libreta</label>
                    <select
                      className="select-styled"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      required
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — Deuda actual: ${c.currentDebt.toFixed(2)} (Límite: ${c.creditLimit.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="glass" style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Pide al cliente escanear el código QR del negocio o realizar la transferencia SPEI antes de confirmar.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsCheckoutOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                    <Check size={18} />
                    <span>Confirmar Cobro</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Printable Thermal Receipt */
              <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                  <Check size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>¡Venta Completada con Éxito!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Inventario actualizado y venta registrada.
                </p>

                <div className="ticket-wrapper">
                  <div className="ticket-header">
                    <div className="ticket-store-name">{settings.storeName.toUpperCase()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>{settings.address}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>TEL: {settings.phone} • RFC: {settings.rfc}</div>
                  </div>

                  <div style={{ fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                    <div><b>TICKET:</b> {receiptSale.id}</div>
                    <div><b>FECHA:</b> {new Date(receiptSale.date).toLocaleString()}</div>
                    <div><b>FORMA DE PAGO:</b> {receiptSale.paymentMethod.toUpperCase()}</div>
                    {receiptSale.customerName && <div><b>CLIENTE:</b> {receiptSale.customerName}</div>}
                  </div>

                  <div className="ticket-divider"></div>

                  <div style={{ fontSize: '0.75rem' }}>
                    {receiptSale.items.map((item, idx) => (
                      <div key={idx} className="ticket-item-row">
                        <div>
                          <div>{item.name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>
                            {item.quantity} x ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ fontWeight: 'bold' }}>${(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="ticket-divider"></div>

                  <div className="ticket-total-row" style={{ fontSize: '0.95rem' }}>
                    <span>TOTAL:</span>
                    <span>${receiptSale.total.toFixed(2)}</span>
                  </div>

                  {receiptSale.paymentMethod === 'cash' && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>PAGÓ CON:</span>
                        <span>${receiptSale.cashReceived?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>CAMBIO:</span>
                        <span>${receiptSale.change?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="ticket-footer">
                    <div>{settings.ticketFooter}</div>
                    <div style={{ marginTop: '0.2rem', fontSize: '0.65rem' }}>SISTEMA MISCELÁNEA LICHITA ERP</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <button className="btn-secondary" onClick={() => window.print()}>
                    <Printer size={16} />
                    <span>Imprimir Ticket</span>
                  </button>
                  <button className="btn-primary" onClick={handleResetAfterSale}>
                    <span>Siguiente Venta</span>
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
