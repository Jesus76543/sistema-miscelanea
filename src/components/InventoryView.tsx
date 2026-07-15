import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Check, 
  X, 
  PackageOpen, 
  ArrowUpDown
} from 'lucide-react';
import type { Product } from './POSView';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Abarrotes');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formMinStock, setFormMinStock] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormId('COD-' + Math.floor(100000 + Math.random() * 900000));
    setFormName('');
    setFormCategory('Abarrotes');
    setFormCustomCategory('');
    setFormPrice('');
    setFormCost('');
    setFormStock('');
    setFormMinStock('5');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    
    const standardCategories = ['Abarrotes', 'Bebidas', 'Botanas', 'Lácteos', 'Panadería', 'Limpieza', 'Otros'];
    if (standardCategories.includes(product.category)) {
      setFormCategory(product.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('Otro Personalizado');
      setFormCustomCategory(product.category);
    }
    
    setFormPrice(product.price.toString());
    setFormCost(product.cost.toString());
    setFormStock(product.stock.toString());
    setFormMinStock(product.minStock.toString());
    setFormError(null);
    setIsModalOpen(true);
  };

  // Delete product
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) {
      onDeleteProduct(id);
    }
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    const name = formName.trim();
    const finalCategory = formCategory === 'Otro Personalizado' ? formCustomCategory.trim() : formCategory;
    const price = parseFloat(formPrice);
    const cost = parseFloat(formCost);
    const stock = parseInt(formStock);
    const minStock = parseInt(formMinStock);

    if (!name) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (!finalCategory) {
      setFormError('La categoría es obligatoria.');
      return;
    }
    if (isNaN(price) || price < 0) {
      setFormError('El precio de venta debe ser un número válido mayor o igual a 0.');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setFormError('El costo de compra debe ser un número válido mayor o igual a 0.');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setFormError('El stock inicial debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (isNaN(minStock) || minStock < 0) {
      setFormError('El stock mínimo debe ser un número entero mayor o igual a 0.');
      return;
    }

    // Check code availability for new products
    if (!editingProduct && products.some(p => p.id === formId)) {
      setFormError('El código de barras ya está registrado en otro producto.');
      return;
    }

    const productData: Product = {
      id: formId.trim() || 'COD-' + Math.floor(100000 + Math.random() * 900000),
      name,
      category: finalCategory,
      price,
      cost,
      stock,
      minStock
    };

    if (editingProduct) {
      onEditProduct(productData);
    } else {
      onAddProduct(productData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="inventory-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <PackageOpen size={28} className="gradient-text-accent" />
          <h2 className="page-title">Control de Inventario</h2>
          <span style={{ fontSize: '0.85rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '50px', fontWeight: 'bold' }}>
            {products.length} Productos
          </span>
        </div>
        
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total en Stock</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.25rem' }}>
              {products.reduce((sum, p) => sum + p.stock, 0)} unidades
            </div>
          </div>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <PackageOpen size={22} />
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Productos Stock Bajo</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--danger)', marginTop: '0.25rem' }}>
              {products.filter(p => p.stock <= p.minStock).length} Alertas
            </div>
          </div>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--danger-glow)', color: 'var(--danger)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Valor del Inventario (Venta)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>
              ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <ArrowUpDown size={22} />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o código de barras..."
            className="input-styled"
            style={{ paddingLeft: '2.5rem', paddingTop: '0.65rem', paddingBottom: '0.65rem', fontSize: '0.9rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Categoría:</span>
          <select
            className="select-styled"
            style={{ padding: '0.65rem 2rem 0.65rem 1rem', fontSize: '0.9rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'Todos' ? '📂 Todas las categorías' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredProducts.length === 0 ? (
        <div className="glass empty-state" style={{ borderRadius: 'var(--radius-lg)' }}>
          <PackageOpen size={48} />
          <h3>No hay productos en inventario</h3>
          <p>No se encontraron productos con los filtros seleccionados. Intenta agregar uno nuevo.</p>
        </div>
      ) : (
        <div className="glass table-wrapper">
          <table className="table-styled">
            <thead>
              <tr>
                <th>Código/Barras</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Costo Compra</th>
                <th style={{ textAlign: 'right' }}>Precio Venta</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th>Stock Mín.</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const isLowStock = product.stock <= product.minStock;

                return (
                  <tr key={product.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '500', color: 'var(--secondary)' }}>
                      {product.id}
                    </td>
                    <td style={{ fontWeight: '600' }}>{product.name}</td>
                    <td>
                      <span className="badge-category">{product.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                      ${product.cost.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>
                      {product.stock}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {product.minStock} u.
                    </td>
                    <td>
                      <span className={`badge-stock ${isLowStock ? 'low' : 'normal'}`}>
                        {isLowStock ? (
                          <>
                            <AlertTriangle size={12} />
                            <span>Stock Bajo</span>
                          </>
                        ) : (
                          <>
                            <Check size={12} />
                            <span>Ok</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                        <button 
                          className="icon-btn edit" 
                          onClick={() => handleOpenEdit(product)}
                          title="Editar Producto"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="icon-btn delete" 
                          onClick={() => handleDelete(product.id, product.name)}
                          title="Eliminar Producto"
                        >
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
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ background: '#111827', border: '1px solid var(--border-color)', maxWidth: '550px' }}>
            <button 
              className="icon-btn" 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>

            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PackageOpen size={24} style={{ color: 'var(--primary)' }} />
              <span>{editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}</span>
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                
                <div className="form-group span-2">
                  <label className="form-label" htmlFor="form-id">Código de Barras / SKU</label>
                  <input
                    id="form-id"
                    type="text"
                    className="input-styled"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="Generando código..."
                    disabled={!!editingProduct} // Cannot change SKU/Code of existing product
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label" htmlFor="form-name">Nombre del Producto</label>
                  <input
                    id="form-name"
                    type="text"
                    className="input-styled"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Refresco de Cola 600ml"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-category">Categoría</label>
                  <select
                    id="form-category"
                    className="select-styled"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Botanas">Botanas</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Panadería">Panadería</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Otros">Otros</option>
                    <option value="Otro Personalizado">Otro Personalizado...</option>
                  </select>
                </div>

                <div className="form-group">
                  {formCategory === 'Otro Personalizado' ? (
                    <>
                      <label className="form-label" htmlFor="form-custom-category">Escribe la Categoría</label>
                      <input
                        id="form-custom-category"
                        type="text"
                        className="input-styled"
                        value={formCustomCategory}
                        onChange={(e) => setFormCustomCategory(e.target.value)}
                        placeholder="Ej. Farmacia"
                        required
                      />
                    </>
                  ) : (
                    <div style={{ opacity: 0.5 }}>
                      <label className="form-label">Categoría Especial</label>
                      <input type="text" className="input-styled" disabled placeholder="N/A" />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-cost">Costo de Compra ($)</label>
                  <input
                    id="form-cost"
                    type="number"
                    step="0.01"
                    className="input-styled"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-price">Precio de Venta ($)</label>
                  <input
                    id="form-price"
                    type="number"
                    step="0.01"
                    className="input-styled"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-stock">Stock Inicial (unidades)</label>
                  <input
                    id="form-stock"
                    type="number"
                    className="input-styled"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-min-stock">Stock Mínimo (alerta)</label>
                  <input
                    id="form-min-stock"
                    type="number"
                    className="input-styled"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    placeholder="5"
                    required
                  />
                </div>

              </div>

              {formError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertTriangle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="modal-footer-btns">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  <Check size={18} />
                  <span>{editingProduct ? 'Guardar Cambios' : 'Registrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
