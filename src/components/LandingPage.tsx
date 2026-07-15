import React from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  Coins 
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="landing-badge">
              <Sparkles size={16} />
              <span>¡La tiendita de tu barrio, ahora 100% digital!</span>
            </div>
            
            <h1 className="landing-title">
              Miscelánea <br />
              <span className="gradient-text-accent">Lichita</span>
            </h1>
            
            <p className="landing-desc">
              Bienvenido al sistema inteligente de inventario y punto de venta. 
              Controla tu stock, registra ventas al instante y administra tu negocio con un diseño premium y de alto rendimiento.
            </p>
            
            <div className="btn-container">
              <button onClick={onEnterApp} className="btn-primary">
                <span>Ingresar al Sistema</span>
                <ArrowRight size={18} />
              </button>
              <a href="#features" className="btn-secondary">
                Ver Características
              </a>
            </div>
          </div>

          <div className="hero-mockup-wrapper animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="hero-mockup">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'monospace' }}>lichita.pos.app</span>
              </div>
              
              <div className="glass" style={{ borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>VENTA ACTIVA</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontWeight: '600' }}>Coca-Cola 600ml x2</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>$38.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontWeight: '600' }}>Papas Sabritas x1</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>$22.00</span>
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '0.75rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700' }}>Total</span>
                  <span style={{ fontWeight: '800', color: 'var(--primary)' }}>$60.00</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="glass" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PRODUCTOS</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>124</div>
                </div>
                <div className="glass" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>VENTAS HOY</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>$1,420</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '4rem auto 0 auto', padding: '0 2rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.25rem', marginBottom: '3rem', fontWeight: 800 }}>
          Diseñado para Facilitar tus <span className="gradient-text">Ventas Diarias</span>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="glass glass-hover" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <Coins size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>Cobro Express (POS)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Registra compras con un buscador inteligente y botones rápidos. Calcula el cambio exacto y simula tickets al instante.
            </p>
          </div>

          <div className="glass glass-hover" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--secondary-glow)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>Control de Stock</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Registra, edita y elimina productos. Monitorea las alertas automáticas de inventario bajo para que nunca te quedes sin stock.
            </p>
          </div>

          <div className="glass glass-hover" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>Persistencia Local</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Tus datos se guardan de forma segura en tu navegador (`localStorage`). No requiere conexiones lentas ni internet para funcionar.
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="glass" style={{ maxWidth: '1200px', margin: '5rem auto 0 auto', padding: '3rem', borderRadius: 'var(--radius-lg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div>
          <h4 style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} className="gradient-text-accent" /> Horario de Atención
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>Lunes a Sábado: 7:00 AM - 10:00 PM</p>
          <p style={{ color: 'var(--text-secondary)' }}>Domingos: 8:00 AM - 9:00 PM</p>
        </div>
        
        <div>
          <h4 style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} className="gradient-text-accent" /> Ubicación
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>Calle Principal #456, Col. Centro</p>
          <p style={{ color: 'var(--text-secondary)' }}>Tu Ciudad, CP 12345</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'lg-flex-end' }}>
          <button onClick={onEnterApp} className="btn-primary" style={{ width: '100%' }}>
            <span>Comenzar a Vender</span>
            <ShoppingBag size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};
