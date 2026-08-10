import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  PieChart, 
  Award, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';
import type { Sale, Product } from '../data/initialProducts';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sales, products }) => {
  
  // Cost map for quick profit calculation
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach(p => map.set(p.id, p));
    return map;
  }, [products]);

  // Overall Financial Metrics
  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const totalCost = useMemo(() => {
    return sales.reduce((sum, sale) => {
      const saleCost = sale.items.reduce((itemSum, item) => {
        const prod = productMap.get(item.productId);
        const cost = prod ? prod.cost : (item.cost || item.price * 0.7);
        return itemSum + (cost * item.quantity);
      }, 0);
      return sum + saleCost;
    }, 0);
  }, [sales, productMap]);

  const netProfit = totalRevenue - totalCost;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  const totalItemsSold = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
  }, [sales]);

  // Top 10 Best Sellers
  const topProducts = useMemo(() => {
    const counts: { [id: string]: { name: string; category: string; quantity: number; revenue: number; profit: number } } = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prod = productMap.get(item.productId);
        const cost = prod ? prod.cost : (item.cost || item.price * 0.7);
        const profitEach = item.price - cost;

        if (!counts[item.productId]) {
          counts[item.productId] = {
            name: item.name,
            category: prod?.category || 'Varios',
            quantity: 0,
            revenue: 0,
            profit: 0
          };
        }
        counts[item.productId].quantity += item.quantity;
        counts[item.productId].revenue += item.price * item.quantity;
        counts[item.productId].profit += profitEach * item.quantity;
      });
    });

    return Object.entries(counts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [sales, productMap]);

  // Sales by Category
  const categoryRevenue = useMemo(() => {
    const revenueMap: { [key: string]: number } = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prod = productMap.get(item.productId);
        const cat = prod?.category || 'Otros';
        revenueMap[cat] = (revenueMap[cat] || 0) + (item.price * item.quantity);
      });
    });

    return Object.entries(revenueMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [sales, productMap]);

  const maxCategoryAmount = useMemo(() => {
    if (categoryRevenue.length === 0) return 1;
    return Math.max(...categoryRevenue.map(c => c.amount));
  }, [categoryRevenue]);

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={28} className="gradient-text-accent" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Métricas y Reportes Financieros</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Análisis de ingresos, margen de rentabilidad y productos más vendidos</p>
          </div>
        </div>

        <span className="live-badge">
          <span className="live-dot"></span>
          <span>{sales.length} Tickets Procesados</span>
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ventas Totales</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ganancia Neta Real</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a5b4fc', marginTop: '0.25rem' }}>
            ${netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Margen Promedio</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>
            {marginPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--info)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ticket Promedio</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--info)', marginTop: '0.25rem' }}>
            ${avgTicket.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Analytics: Category Bar Chart + Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: categoryRevenue.length > 0 ? '1.25fr 0.75fr' : '1fr', gap: '1.25rem' }}>
        
        {categoryRevenue.length > 0 ? (
          <>
            {/* CSS Bar Chart */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={18} style={{ color: 'var(--primary)' }} />
                <span>Ingresos por Categoría ($)</span>
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '1.5rem', gap: '0.75rem' }}>
                {categoryRevenue.map(({ category, amount }) => {
                  const percentage = (amount / maxCategoryAmount) * 100;
                  return (
                    <div key={category} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          maxWidth: '42px', 
                          height: `${Math.max(percentage, 6)}%`,
                          background: 'linear-gradient(0deg, var(--secondary) 0%, var(--primary) 100%)',
                          borderRadius: '4px 4px 0 0',
                          position: 'relative',
                          transition: 'height 0.4s ease'
                        }}
                      >
                        <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                          ${amount.toFixed(0)}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60px' }}>
                        {category}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List breakdown */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Resumen de Departamentos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {categoryRevenue.map(({ category, amount }) => (
                    <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{category}</span>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                        ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1rem' }}>
                <ArrowUpRight size={14} />
                <span>Total de piezas vendidas en el sistema: <b>{totalItemsSold} u.</b></span>
              </div>
            </div>
          </>
        ) : (
          <div className="glass empty-state" style={{ gridColumn: 'span 2' }}>
            <ShoppingBag size={40} />
            <h3>No hay datos de ventas para mostrar</h3>
            <p>Realiza ventas desde el punto de cobro para ver gráficos.</p>
          </div>
        )}
      </div>

      {/* Top 10 Best Sellers Table */}
      <div style={{ marginTop: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} className="gradient-text-accent" />
          <span>Top 10 Productos Más Vendidos</span>
        </h3>

        <div className="glass table-wrapper">
          {topProducts.length === 0 ? (
            <div className="empty-state">
              <Calendar size={40} />
              <h3>Aún no hay productos vendidos</h3>
            </div>
          ) : (
            <table className="table-styled">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Posición</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'center' }}>Unidades Vendidas</th>
                  <th style={{ textAlign: 'right' }}>Ingreso Total</th>
                  <th style={{ textAlign: 'right' }}>Ganancia Generada</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.name}
                    </td>
                    <td>
                      <span className="badge-category">{p.category}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>
                      {p.quantity} pzs
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      ${p.revenue.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#a5b4fc' }}>
                      +${p.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
