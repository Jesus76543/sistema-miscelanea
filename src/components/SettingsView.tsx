import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Save, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  FileJson, 
  ShieldAlert, 
  Palette, 
  Moon, 
  Sun, 
  Sparkles, 
  Flame 
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import type { AppTheme } from '../App';
import type { StoreSettings, Product, Sale, CustomerAccount, CashMovement } from '../data/initialProducts';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_CASH_MOVEMENTS, INITIAL_SALES, INITIAL_SETTINGS } from '../data/initialProducts';

interface SettingsViewProps {
  settings: StoreSettings;
  products: Product[];
  sales: Sale[];
  customers: CustomerAccount[];
  cashMovements: CashMovement[];
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onRestoreAllData: (data: {
    products: Product[];
    sales: Sale[];
    customers: CustomerAccount[];
    cashMovements: CashMovement[];
    settings: StoreSettings;
  }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  products,
  sales,
  customers,
  cashMovements,
  currentTheme,
  onThemeChange,
  onSaveSettings,
  onRestoreAllData
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    soundManager.setEnabled(formData.soundEnabled);
    soundManager.playCashRegister();
    showToast('¡Configuración guardada exitosamente!');
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Export full database as JSON
  const handleExportBackup = () => {
    const fullBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      storeName: formData.storeName,
      settings: formData,
      products,
      sales,
      customers,
      cashMovements
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullBackup, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `respaldo_lichita_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('¡Respaldo JSON descargado!');
  };

  // Import full database from JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (!e.target.files || e.target.files.length === 0) return;

    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && parsed.sales) {
          onRestoreAllData({
            products: parsed.products || [],
            sales: parsed.sales || [],
            customers: parsed.customers || [],
            cashMovements: parsed.cashMovements || [],
            settings: parsed.settings || INITIAL_SETTINGS
          });
          setFormData(parsed.settings || INITIAL_SETTINGS);
          showToast('¡Base de datos restaurada correctamente!');
          soundManager.playCashRegister();
        } else {
          alert('El archivo no contiene un formato de respaldo válido de Miscelánea Lichita.');
        }
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
  };

  // Factory Demo Reset
  const handleFactoryReset = () => {
    if (window.confirm('¿Deseas restaurar el catálogo completo de demostración (45 productos, clientes y movimientos de prueba)? Los datos actuales serán reemplazados.')) {
      onRestoreAllData({
        products: INITIAL_PRODUCTS,
        sales: INITIAL_SALES,
        customers: INITIAL_CUSTOMERS,
        cashMovements: INITIAL_CASH_MOVEMENTS,
        settings: INITIAL_SETTINGS
      });
      setFormData(INITIAL_SETTINGS);
      showToast('¡Catálogo inicial de 45 productos restaurado!');
      soundManager.playCashRegister();
    }
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} className="gradient-text-accent" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ajustes del Sistema</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personalización de temas de color, tickets, sonido y respaldos</p>
          </div>
        </div>

        {successMessage && (
          <div className="live-badge animate-fade-in" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Theme Picker Section */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={20} style={{ color: 'var(--primary)' }} />
          <span>Tema Visual y Paleta de Colores</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Selecciona la combinación de colores que mejor se adapte a tu gusto o iluminación de la tienda.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Theme 1: Luxe */}
          <div 
            className="glass glass-hover" 
            style={{ 
              padding: '1.15rem', 
              borderRadius: 'var(--radius-md)', 
              cursor: 'pointer',
              border: currentTheme === 'luxe' ? '2px solid #10b981' : '1px solid var(--border-color)',
              background: currentTheme === 'luxe' ? 'rgba(16, 185, 129, 0.1)' : undefined
            }}
            onClick={() => onThemeChange('luxe')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Moon size={16} style={{ color: '#10b981' }} />
                <span>Obsidian Luxe (Oscuro)</span>
              </span>
              {currentTheme === 'luxe' && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Fondo negro obsidiana con acentos esmeralda y oro.</p>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#07090e', border: '1px solid #fff' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10b981' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#6366f1' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f59e0b' }}></div>
            </div>
          </div>

          {/* Theme 2: Light */}
          <div 
            className="glass glass-hover" 
            style={{ 
              padding: '1.15rem', 
              borderRadius: 'var(--radius-md)', 
              cursor: 'pointer',
              border: currentTheme === 'light' ? '2px solid #059669' : '1px solid var(--border-color)',
              background: currentTheme === 'light' ? 'rgba(5, 150, 105, 0.1)' : undefined
            }}
            onClick={() => onThemeChange('light')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sun size={16} style={{ color: '#059669' }} />
                <span>Clean Minimal (Claro)</span>
              </span>
              {currentTheme === 'light' && <CheckCircle2 size={16} style={{ color: '#059669' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Estilo Apple / Square POS blanco puro y súper nítido.</p>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #ccc' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#059669' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#4f46e5' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0f172a' }}></div>
            </div>
          </div>

          {/* Theme 3: Cyber */}
          <div 
            className="glass glass-hover" 
            style={{ 
              padding: '1.15rem', 
              borderRadius: 'var(--radius-md)', 
              cursor: 'pointer',
              border: currentTheme === 'cyber' ? '2px solid #a855f7' : '1px solid var(--border-color)',
              background: currentTheme === 'cyber' ? 'rgba(168, 85, 247, 0.1)' : undefined
            }}
            onClick={() => onThemeChange('cyber')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={16} style={{ color: '#a855f7' }} />
                <span>Cyberpunk Violet</span>
              </span>
              {currentTheme === 'cyber' && <CheckCircle2 size={16} style={{ color: '#a855f7' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Noche violeta eléctrica con acentos cian y rosa neón.</p>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#080612', border: '1px solid #a855f7' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#a855f7' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#06b6d4' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#ec4899' }}></div>
            </div>
          </div>

          {/* Theme 4: Sunset */}
          <div 
            className="glass glass-hover" 
            style={{ 
              padding: '1.15rem', 
              borderRadius: 'var(--radius-md)', 
              cursor: 'pointer',
              border: currentTheme === 'sunset' ? '2px solid #f97316' : '1px solid var(--border-color)',
              background: currentTheme === 'sunset' ? 'rgba(249, 115, 22, 0.1)' : undefined
            }}
            onClick={() => onThemeChange('sunset')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flame size={16} style={{ color: '#f97316' }} />
                <span>Sunset Tiendita (Cálido)</span>
              </span>
              {currentTheme === 'sunset' && <CheckCircle2 size={16} style={{ color: '#f97316' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Tonos terracota, miel dorada y madera cálida.</p>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#0c0908', border: '1px solid #f97316' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f97316' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#eab308' }}></div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff7ed' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        {/* Settings Form */}
        <div className="glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={20} style={{ color: 'var(--primary)' }} />
            <span>Datos del Negocio (Aparecen en el Ticket)</span>
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre Comercial de la Tienda</label>
                <input
                  type="text"
                  className="input-styled"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Dueño / Responsable</label>
                <input
                  type="text"
                  className="input-styled"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input
                  type="text"
                  className="input-styled"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">RFC / Identificación Fiscal</label>
                <input
                  type="text"
                  className="input-styled"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Dirección Completa</label>
                <input
                  type="text"
                  className="input-styled"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">Mensaje al Pie del Ticket</label>
                <input
                  type="text"
                  className="input-styled"
                  value={formData.ticketFooter}
                  onChange={(e) => setFormData({ ...formData, ticketFooter: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fondo de Caja Inicial ($)</label>
                <input
                  type="number"
                  step="50"
                  className="input-styled"
                  value={formData.initialCashFund}
                  onChange={(e) => setFormData({ ...formData, initialCashFund: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label className="form-label">Efectos de Sonido (Web Audio)</label>
                <button
                  type="button"
                  className={`btn-secondary ${formData.soundEnabled ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: formData.soundEnabled ? 'var(--primary-glow)' : 'transparent', borderColor: formData.soundEnabled ? 'var(--primary)' : 'var(--border-color)' }}
                  onClick={() => setFormData({ ...formData, soundEnabled: !formData.soundEnabled })}
                >
                  {formData.soundEnabled ? <Volume2 size={18} style={{ color: 'var(--primary)' }} /> : <VolumeX size={18} />}
                  <span>{formData.soundEnabled ? 'Sonidos Activados (Bips/Caja)' : 'Silencio'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">
                <Save size={18} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database & Backup Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Backup card */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileJson size={20} style={{ color: 'var(--secondary)' }} />
              <span>Respaldo y Portabilidad de Datos</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Exporta toda la información (inventario, ventas, clientes fiados y caja) a un archivo `.json` o restaura un archivo anterior.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={handleExportBackup}>
                <Download size={16} />
                <span>Descargar Copia de Seguridad JSON</span>
              </button>

              <label className="btn-secondary" style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
                <Upload size={16} />
                <span>Restaurar Copia desde JSON</span>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportBackup}
                />
              </label>
            </div>
          </div>

          {/* Reset card */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} />
              <span>Restaurar Catálogo de Fábrica</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Rellena la base de datos con el catálogo completo de 45 productos representativos de abarroteras mexicanas.
            </p>

            <button className="btn-danger" style={{ width: '100%' }} onClick={handleFactoryReset}>
              <RotateCcw size={16} />
              <span>Cargar 45 Productos Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
