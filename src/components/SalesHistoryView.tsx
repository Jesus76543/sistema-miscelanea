import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  History, 
  Calendar, 
  CreditCard, 
  ArrowUpRight, 
  ShoppingBag,
  Coins
} from 'lucide-react';
import type { Sale, Product } from './POSView';

interface SalesHistoryViewProps {
  sales: Sale[];
  products: Product[];
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ sales, products }) => {
  
  // Create a product map for quick lookup of cost
  const productCostMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      map.set(p.id, p.cost);
    });
    return map;
  }, [products]);

  // Math Metrics
  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  }, [sales]);

  const totalProfit = useMemo(() => {
    return sales.reduce((totalSalesProfit, sale) => {
      const saleProfit = sale.items.reduce((itemSum, item) => {
        const cost = productCostMap.get(item.productId) || 0;
        const profitEach = item.price - cost;
        return itemSum + (profitEach * item.quantity);
      }, 0);
      return totalSalesProfit + saleProfit;
    }, 0);
  }, [sales, productCostMap]);

  const totalTransactions = sales.length;

  // Chart data: revenue by category
  const categoryRevenue = useMemo(() => {
    const revenueMap: { [key: string]: number } = {};
    
    // Create map of products to categories
    const productCategoryMap = new Map<string, string>();
    products.forEach(p => {
      productCategoryMap.set(p.id, p.category);
    });

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const cat = productCategoryMap.get(item.productId) || 'Otros';
        const itemRevenue = item.price * item.quantity;
        revenueMap[cat] = (revenueMap[cat] || 0) + itemRevenue;
      });
    });

    return Object.entries(revenueMap).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);
  }, [sales, products]);

  // Max value for scaling the chart
  const maxCategoryAmount = useMemo(() => {
    if (categoryRevenue.length === 0) return 1;
    return Math.max(...categoryRevenue.map(c => c.amount));
  }, [categoryRevenue]);

  return (
    <div className="inventory-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <History size={28} className="gradient-text-accent" />
          <h2 className="page-title">Historial de Ventas</h2>
          <span style={{ fontSize: '0.85rem', background: 'var(--secondary-glow)', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '50px', fontWeight: 'bold' }}>
            {sales.length} Tickets guardados
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="sales-grid">
        {/* Metric 1 */}
        <div className="glass metric-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="metric-icon-box green">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="metric-label">Ingresos Totales</div>
            <div className="metric-value">
              ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass metric-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div className="metric-icon-box purple">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="metric-label">Ganancia Neta Est.</div>
            <div className="metric-value" style={{ color: '#a5b4fc' }}>
              ${totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass metric-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="metric-icon-box amber">
            <Coins size={24} />
          </div>
          <div>
            <div className="metric-label">Transacciones (Tickets)</div>
            <div className="metric-value">
              {totalTransactions}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: categoryRevenue.length > 0 ? '1.2fr 0.8fr' : '1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
        {categoryRevenue.length > 0 ? (
          <>
            {/* Chart Card */}
            <div className="glass sales-chart-card animate-fade-in-up" style={{ borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                Ventas por Categoría ($)
              </h3>
              
              <div className="chart-bar-container">
                {categoryRevenue.map(({ category, amount }) => {
                  const percentage = (amount / maxCategoryAmount) * 100;
                  return (
                    <div key={category} className="chart-bar-wrapper">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${Math.max(percentage, 5)}%` }}
                      >
                        <div className="chart-bar-value">${amount.toFixed(0)}</div>
                      </div>
                      <div className="chart-bar-label">{category}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List Breakdown Card */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Resumen de Categorías</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {categoryRevenue.map(({ category, amount }) => (
                    <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: '500' }}>{category}</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                        ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowUpRight size={14} />
                <span>Las categorías se actualizan en tiempo real con cada ticket.</span>
              </div>
            </div>
          </>
        ) : (
          <div className="glass empty-state" style={{ borderRadius: 'var(--radius-lg)', gridColumn: 'span 2' }}>
            <ShoppingBag size={48} />
            <h3>No hay datos para graficar</h3>
            <p>Realiza ventas en el punto de cobro para ver las estadísticas de tu negocio.</p>
          </div>
        )}
      </div>

      {/* Transaction History Log Table */}
      <div style={{ marginTop: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} className="gradient-text-accent" />
          Registro de Transacciones
        </h3>
        
        {sales.length === 0 ? (
          <div className="glass empty-state" style={{ borderRadius: 'var(--radius-lg)' }}>
            <Calendar size={48} />
            <h3>Historial vacío</h3>
            <p>Aún no se ha realizado ninguna transacción de cobro.</p>
          </div>
        ) : (
          <div className="glass table-wrapper">
            <table className="table-styled">
              <thead>
                <tr>
                  <th>Folio / Código</th>
                  <th>Fecha y Hora</th>
                  <th>Productos Vendidos</th>
                  <th style={{ textAlign: 'center' }}>Método de Pago</th>
                  <th style={{ textAlign: 'right' }}>Total Cobrado</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--secondary)' }}>
                      {sale.id}
                    </td>
                    <td>
                      {new Date(sale.date).toLocaleString('es-MX')}
                    </td>
                    <td style={{ fontSize: '0.9rem', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-category" style={{ 
                        background: sale.paymentMethod === 'cash' ? 'var(--primary-glow)' : 'var(--secondary-glow)',
                        color: sale.paymentMethod === 'cash' ? '#a7f3d0' : '#c7d2fe',
                        borderColor: sale.paymentMethod === 'cash' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        {sale.paymentMethod === 'cash' ? (
                          <>
                            <Coins size={12} />
                            <span>Efectivo</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={12} />
                            <span>Tarjeta</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--primary)', fontSize: '1.05rem' }}>
                      ${sale.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
