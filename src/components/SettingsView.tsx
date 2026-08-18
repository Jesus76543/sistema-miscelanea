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
  ShieldAlert 
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import type { StoreSettings, Product, Sale, CustomerAccount, CashMovement } from '../data/initialProducts';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_CASH_MOVEMENTS, INITIAL_SALES, INITIAL_SETTINGS } from '../data/initialProducts';

interface SettingsViewProps {
  settings: StoreSettings;
  products: Product[];
  sales: Sale[];
  customers: CustomerAccount[];
  cashMovements: CashMovement[];
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
