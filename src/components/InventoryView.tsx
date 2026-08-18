import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  PackageOpen, 
  LayoutGrid, 
  List, 
  Truck, 
  ClipboardList, 
  Printer 
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import type { Product } from '../data/initialProducts';
import { getCategoryIcon } from './POSView';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onQuickUpdateStock: (id: string, delta: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  onQuickUpdateStock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockListOpen, setIsRestockListOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Abarrotes');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formUnit, setFormUnit] = useState<'pza' | 'kg' | 'paq' | 'litro'>('pza');
  const [formSupplier, setFormSupplier] = useState('');
  const [formEmoji, setFormEmoji] = useState('📦');
  const [formError, setFormError] = useState<string | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesStock = true;
      if (filterStockStatus === 'low') matchesStock = p.stock <= p.minStock && p.stock > 0;
      if (filterStockStatus === 'out') matchesStock = p.stock <= 0;

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, selectedCategory, searchQuery, filterStockStatus]);

  // Suggested Restock List (Products with stock <= minStock)
  const restockList = useMemo(() => {
    return products
      .filter(p => p.stock <= p.minStock)
      .map(p => ({
        ...p,
        suggestedQuantity: Math.max(12, p.minStock * 3) - p.stock
      }));
  }, [products]);

  // Profit Margin Calculator Helper
  const calculatedMargin = useMemo(() => {
    const p = parseFloat(formPrice);
    const c = parseFloat(formCost);
    if (!isNaN(p) && !isNaN(c) && p > 0) {
      return (((p - c) / p) * 100).toFixed(1);
    }
    return '0.0';
  }, [formPrice, formCost]);

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormId('750' + Math.floor(1000000000 + Math.random() * 9000000000));
    setFormName('');
    setFormCategory('Abarrotes');
    setFormPrice('');
    setFormCost('');
    setFormStock('10');
    setFormMinStock('5');
    setFormUnit('pza');
    setFormSupplier('');
    setFormEmoji('📦');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price.toString());
    setFormCost(product.cost.toString());
    setFormStock(product.stock.toString());
    setFormMinStock(product.minStock.toString());
    setFormUnit(product.unit || 'pza');
    setFormSupplier(product.supplier || '');
    setFormEmoji(product.emoji || '📦');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${name}" del catálogo?`)) {
      onDeleteProduct(id);
      soundManager.playError();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = formName.trim();
    const price = parseFloat(formPrice);
    const cost = parseFloat(formCost);
    const stock = parseInt(formStock);
    const minStock = parseInt(formMinStock);

    if (!name) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (isNaN(price) || price < 0) {
      setFormError('El precio de venta no es válido.');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setFormError('El costo de compra no es válido.');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setFormError('El stock debe ser 0 o superior.');
      return;
    }

    const productData: Product = {
      id: formId.trim() || 'SKU-' + Date.now(),
      name,
      category: formCategory,
      price,
      cost,
      stock,
      minStock,
      unit: formUnit,
      supplier: formSupplier.trim() || undefined,
      emoji: formEmoji
    };

    if (editingProduct) {
      onEditProduct(productData);
    } else {
      onAddProduct(productData);
    }

    setIsModalOpen(false);
    soundManager.playCashRegister();
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <PackageOpen size={28} className="gradient-text-accent" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Control de Inventario y Catálogo</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {products.length} productos registrados • Valuación de inventario: <b>${products.reduce((s, p) => s + (p.cost * p.stock), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b> (Costo)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => setIsRestockListOpen(true)}>
            <ClipboardList size={16} />
            <span>Lista de Resurtido ({restockList.length})</span>
          </button>

          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Registrar Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unidades en Existencia</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {products.reduce((sum, p) => sum + p.stock, 0)} unidades
          </div>
        </div>

        <div 
          className="glass" 
          style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger)', cursor: 'pointer' }}
          onClick={() => setFilterStockStatus(filterStockStatus === 'low' ? 'all' : 'low')}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Stock Bajo (Por agotarse)</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>
            {products.filter(p => p.stock <= p.minStock && p.stock > 0).length} Alertas
          </div>
        </div>

        <div 
          className="glass" 
          style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent)', cursor: 'pointer' }}
          onClick={() => setFilterStockStatus(filterStockStatus === 'out' ? 'all' : 'out')}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Productos Agotados (0 u.)</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>
            {products.filter(p => p.stock <= 0).length} sin stock
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar por código de barras, nombre o proveedor..."
              className="input-styled"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-styled"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'Todos' ? '📂 Todas las categorías' : cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className={`btn-secondary ${filterStockStatus === 'all' ? 'active' : ''}`}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => setFilterStockStatus('all')}
          >
            Todos
          </button>
          <button 
            className={`btn-secondary ${filterStockStatus === 'low' ? 'active' : ''}`}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)' }}
            onClick={() => setFilterStockStatus('low')}
          >
            Stock Bajo
          </button>
          <button 
            className={`btn-secondary ${filterStockStatus === 'out' ? 'active' : ''}`}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent)' }}
            onClick={() => setFilterStockStatus('out')}
          >
            Agotados
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 0.25rem' }}></div>

          <button 
            className={`icon-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista en Tabla"
          >
            <List size={18} />
          </button>
          <button 
            className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista en Cuadrícula"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Content: Table View vs Grid View */}
      {filteredProducts.length === 0 ? (
        <div className="glass empty-state" style={{ borderRadius: 'var(--radius-lg)' }}>
          <PackageOpen size={48} />
          <h3>No se encontraron productos</h3>
          <p>Prueba con otros términos de búsqueda o agrega un nuevo producto.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="glass table-wrapper">
          <table className="table-styled">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Icon</th>
                <th>Código de Barras</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th style={{ textAlign: 'right' }}>Costo</th>
                <th style={{ textAlign: 'right' }}>Venta</th>
                <th style={{ textAlign: 'center' }}>% Margen</th>
                <th style={{ textAlign: 'center' }}>Stock Actual</th>
                <th style={{ textAlign: 'center' }}>Ajuste Rápido</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const isLowStock = product.stock <= product.minStock;
                const margin = product.price > 0 ? (((product.price - product.cost) / product.price) * 100).toFixed(0) : '0';

                return (
                  <tr key={product.id}>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{getCategoryIcon(product.category)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      {product.id}
                    </td>
                    <td style={{ fontWeight: 700 }}>{product.name}</td>
                    <td>
                      <span className="badge-category">{product.category}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {product.supplier || 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                      ${product.cost.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe' }}>
                        {margin}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-stock ${isLowStock ? 'low' : 'normal'}`}>
                        {product.stock <= 0 ? 'Agotado' : `${product.stock} ${product.unit}`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                        <button 
                          className="quick-stock-btn" 
                          title="Restar 1 unidad"
                          onClick={() => onQuickUpdateStock(product.id, -1)}
                        >
                          -1
                        </button>
                        <button 
                          className="quick-stock-btn" 
                          title="Sumar 1 unidad"
                          onClick={() => onQuickUpdateStock(product.id, 1)}
                        >
                          +1
                        </button>
                        <button 
                          className="quick-stock-btn" 
                          title="Sumar paquete (+5)"
                          onClick={() => onQuickUpdateStock(product.id, 5)}
                        >
                          +5
                        </button>
                        <button 
                          className="quick-stock-btn" 
                          title="Sumar caja (+10)"
                          onClick={() => onQuickUpdateStock(product.id, 10)}
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                        <button className="icon-btn" onClick={() => handleOpenEdit(product)} title="Editar">
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(product.id, product.name)} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map(product => {
            const isLowStock = product.stock <= product.minStock;
            const margin = product.price > 0 ? (((product.price - product.cost) / product.price) * 100).toFixed(0) : '0';

            return (
              <div key={product.id} className="glass glass-hover" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '190px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'inline-flex', padding: '0.4rem', background: 'var(--bg-main)', borderRadius: '8px', alignItems: 'center' }}>{getCategoryIcon(product.category)}</span>
                    <span className={`badge-stock ${isLowStock ? 'low' : 'normal'}`}>
                      {product.stock <= 0 ? 'Agotado' : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>{product.id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{product.supplier || 'Proveedor estándar'}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Costo: ${product.cost.toFixed(2)} ({margin}%)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>${product.price.toFixed(2)}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="icon-btn" onClick={() => handleOpenEdit(product)}>
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(product.id, product.name)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add/Edit Product */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <button className="icon-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={() => setIsModalOpen(false)}>
              <X size={18} />
            </button>

            <h3 className="modal-title">
              <PackageOpen size={22} style={{ color: 'var(--primary)' }} />
              <span>{editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}</span>
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label className="form-label">Código de Barras / SKU</label>
                  <input
                    type="text"
                    className="input-styled"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Nombre del Producto</label>
                  <input
                    type="text"
                    className="input-styled"
                    placeholder="Ej. Coca-Cola 600ml Desechable"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select
                    className="select-styled"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Bebidas">Bebidas</option>
                    <option value="Botanas">Botanas</option>
                    <option value="Panadería">Panadería</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Dulces">Dulces</option>
                    <option value="Varios">Varios</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Proveedor</label>
                  <input
                    type="text"
                    className="input-styled"
                    placeholder="Ej. Bimbo, Coca-Cola, Sabritas"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Costo Proveedor ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    className="input-styled"
                    placeholder="0.00"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Precio al Público ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    className="input-styled"
                    placeholder="0.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group span-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Margen de Ganancia Estimado:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>{calculatedMargin}%</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Stock en Tienda</label>
                  <input
                    type="number"
                    className="input-styled"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    className="input-styled"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              {formError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  <span>{editingProduct ? 'Guardar Cambios' : 'Registrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Suggested Restock List for Suppliers */}
      {isRestockListOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <button className="icon-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={() => setIsRestockListOpen(false)}>
              <X size={18} />
            </button>

            <h3 className="modal-title">
              <Truck size={22} style={{ color: 'var(--primary)' }} />
              <span>Lista de Resurtido Sugerido</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Productos que están por debajo de su stock mínimo y requieren pedido a proveedores.
            </p>

            <div className="glass table-wrapper" style={{ maxHeight: '340px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {restockList.length === 0 ? (
                <div className="empty-state">
                  <Check size={36} style={{ color: 'var(--primary)' }} />
                  <h4>¡Inventario completo!</h4>
                  <p>Todos los productos tienen existencias por encima del mínimo.</p>
                </div>
              ) : (
                <table className="table-styled">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Proveedor</th>
                      <th style={{ textAlign: 'center' }}>Stock Actual</th>
                      <th style={{ textAlign: 'center' }}>Sugerido a Pedir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restockList.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.supplier || 'Varios'}</td>
                        <td style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 800 }}>{item.stock} u.</td>
                        <td style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 800 }}>+{item.suggestedQuantity} u.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Imprimir Lista</span>
              </button>
              <button className="btn-primary" onClick={() => setIsRestockListOpen(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
