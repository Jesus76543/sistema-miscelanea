import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  UserPlus, 
  Search, 
  DollarSign, 
  Users, 
  AlertCircle, 
  Plus, 
  Minus, 
  History, 
  Phone, 
  MapPin, 
  X, 
  Trash2 
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import type { CustomerAccount, FiadoMovement } from '../data/initialProducts';

interface FiadosViewProps {
  customers: CustomerAccount[];
  onAddCustomer: (customer: CustomerAccount) => void;
  onUpdateCustomer: (customer: CustomerAccount) => void;
  onDeleteCustomer: (id: string) => void;
}

export const FiadosView: React.FC<FiadosViewProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyDebtors, setOnlyDebtors] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  
  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);

  // Form states for New Customer
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLimit, setFormLimit] = useState('500');

  // Form states for Abono / Cargo
  const [movementAmount, setMovementAmount] = useState('');
  const [movementNote, setMovementNote] = useState('');

  // Math Metrics
  const totalDebt = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.currentDebt, 0);
  }, [customers]);

  const activeDebtorsCount = useMemo(() => {
    return customers.filter(c => c.currentDebt > 0).length;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.phone.includes(searchQuery) ||
                            c.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDebt = onlyDebtors ? c.currentDebt > 0 : true;
      return matchesSearch && matchesDebt;
    });
  }, [customers, searchQuery, onlyDebtors]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormLimit('500');
    setIsAddCustomerOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newCustomer: CustomerAccount = {
      id: 'CLI-' + Math.floor(100 + Math.random() * 900),
      name: formName.trim(),
      phone: formPhone.trim(),
      address: formAddress.trim(),
      creditLimit: parseFloat(formLimit) || 500,
      currentDebt: 0,
      history: [
        {
          id: 'MOV-' + Date.now(),
          date: new Date().toISOString(),
          type: 'payment',
          amount: 0,
          note: 'Apertura de cuenta de cliente'
        }
      ]
    };

    onAddCustomer(newCustomer);
    setIsAddCustomerOpen(false);
    soundManager.playCashRegister();
  };

  const handleProcessAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newMovement: FiadoMovement = {
      id: 'ABO-' + Date.now(),
      date: new Date().toISOString(),
      type: 'payment',
      amount,
      note: movementNote.trim() || 'Abono en efectivo'
    };

    const updatedCustomer: CustomerAccount = {
      ...selectedCustomer,
      currentDebt: Math.max(0, selectedCustomer.currentDebt - amount),
      history: [newMovement, ...selectedCustomer.history]
    };

    onUpdateCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    setIsAbonoModalOpen(false);
    setMovementAmount('');
    setMovementNote('');
    soundManager.playCashRegister();
  };

  const handleProcessCargo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newMovement: FiadoMovement = {
      id: 'CAR-' + Date.now(),
      date: new Date().toISOString(),
      type: 'charge',
      amount,
      note: movementNote.trim() || 'Compra fiada manual'
    };

    const updatedCustomer: CustomerAccount = {
      ...selectedCustomer,
      currentDebt: selectedCustomer.currentDebt + amount,
      history: [newMovement, ...selectedCustomer.history]
    };

    onUpdateCustomer(updatedCustomer);
    setSelectedCustomer(updatedCustomer);
    setIsCargoModalOpen(false);
    setMovementAmount('');
    setMovementNote('');
    soundManager.playScanBeep();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la cuenta de "${name}"?`)) {
      onDeleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  return (
    <div className="view-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={28} className="gradient-text-accent" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Libreta de Fiados</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cuentas por cobrar y créditos otorgados a vecinos</p>
          </div>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          <UserPlus size={18} />
          <span>Nuevo Cliente Fiado</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total por Cobrar (Deuda)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>
            ${totalDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Vecinos con Adeudo</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>
            {activeDebtorsCount} de {customers.length}
          </div>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Cuentas Registradas</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {customers.length} clientes
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass" style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrapper" style={{ minWidth: '260px' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o dirección..."
            className="input-styled"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={onlyDebtors}
            onChange={(e) => setOnlyDebtors(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
          />
          <span>Mostrar solo cuentas con saldo pendiente</span>
        </label>
      </div>

      {/* Layout: Customer List + Details Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedCustomer ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
        
        {/* Table / List */}
        <div className="glass table-wrapper">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <h3>No se encontraron clientes</h3>
              <p>Registra a un vecino para comenzar a llevar su cuenta.</p>
            </div>
          ) : (
            <table className="table-styled">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto / Dirección</th>
                  <th style={{ textAlign: 'right' }}>Límite</th>
                  <th style={{ textAlign: 'right' }}>Deuda Actual</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const isExceeded = customer.currentDebt >= customer.creditLimit;
                  const isSelected = selectedCustomer?.id === customer.id;

                  return (
                    <tr 
                      key={customer.id}
                      style={{ 
                        background: isSelected ? 'rgba(99, 102, 241, 0.1)' : undefined,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{customer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontFamily: 'monospace' }}>{customer.id}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div>{customer.phone || 'Sin teléfono'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{customer.address}</div>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        ${customer.creditLimit.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontWeight: 800, 
                          fontSize: '1rem', 
                          color: customer.currentDebt > 0 ? (isExceeded ? 'var(--danger)' : 'var(--accent)') : 'var(--primary)' 
                        }}>
                          ${customer.currentDebt.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                        >
                          Ver Cuenta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Customer Detail Drawer */}
        {selectedCustomer && (
          <div className="glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedCustomer.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Phone size={14} /> {selectedCustomer.phone || 'Sin teléfono'}
                  <span>•</span>
                  <MapPin size={14} /> {selectedCustomer.address || 'Sin dirección'}
                </div>
              </div>

              <button className="icon-btn" onClick={() => setSelectedCustomer(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Debt status card */}
            <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Saldo Deudor Pendiente</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedCustomer.currentDebt > 0 ? 'var(--danger)' : 'var(--primary)' }}>
                  ${selectedCustomer.currentDebt.toFixed(2)}
                </span>
              </div>

              {/* Progress bar of credit limit */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (selectedCustomer.currentDebt / selectedCustomer.creditLimit) * 100)}%`,
                    background: selectedCustomer.currentDebt >= selectedCustomer.creditLimit ? 'var(--danger)' : 'var(--accent)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>$0.00</span>
                <span>Límite: ${selectedCustomer.creditLimit.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions for Abono / Cargo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setMovementAmount('');
                  setMovementNote('');
                  setIsAbonoModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Registrar Abono ($)</span>
              </button>

              <button 
                className="btn-secondary"
                onClick={() => {
                  setMovementAmount('');
                  setMovementNote('');
                  setIsCargoModalOpen(true);
                }}
              >
                <Minus size={16} />
                <span>Cargar Deuda (+)</span>
              </button>
            </div>

            {/* History of customer movements */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <History size={16} />
                <span>Historial de Movimientos</span>
              </div>

              {selectedCustomer.history.map(item => (
                <div 
                  key={item.id}
                  style={{ 
                    padding: '0.65rem 0.85rem', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: item.type === 'payment' ? 'var(--primary)' : 'var(--danger)' }}>
                      {item.type === 'payment' ? '▼ Abono / Pago' : '▲ Cargo / Compra'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.note} • {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: item.type === 'payment' ? 'var(--primary)' : 'var(--danger)' }}>
                    {item.type === 'payment' ? `-$${item.amount.toFixed(2)}` : `+$${item.amount.toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn-danger"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => handleDelete(selectedCustomer.id, selectedCustomer.name)}
              >
                <Trash2 size={14} />
                <span>Eliminar Cuenta</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: New Customer */}
      {isAddCustomerOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              <UserPlus size={22} style={{ color: 'var(--primary)' }} />
              <span>Registrar Nuevo Cliente</span>
            </h3>

            <form onSubmit={handleSaveCustomer}>
              <div className="form-grid">
                <div className="form-group span-2">
                  <label className="form-label">Nombre del Cliente / Apodo</label>
                  <input
                    type="text"
                    className="input-styled"
                    placeholder="Ej. Doña Carmen (Vecina #4)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono (WhatsApp)</label>
                  <input
                    type="tel"
                    className="input-styled"
                    placeholder="55-1234-5678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Límite de Crédito ($)</label>
                  <input
                    type="number"
                    step="50"
                    className="input-styled"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Dirección o Referencia de su casa</label>
                  <input
                    type="text"
                    className="input-styled"
                    placeholder="Ej. Casa verde frente a la panadería"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddCustomerOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Abono */}
      {isAbonoModalOpen && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ color: 'var(--primary)' }}>
              <DollarSign size={22} />
              <span>Registrar Abono a Cuenta</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Cliente: <b>{selectedCustomer.name}</b> (Deuda: ${selectedCustomer.currentDebt.toFixed(2)})
            </p>

            <form onSubmit={handleProcessAbono}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Monto del Abono ($)</label>
                <input
                  type="number"
                  step="0.50"
                  className="input-styled"
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Nota o Concepto (opcional)</label>
                <input
                  type="text"
                  className="input-styled"
                  placeholder="Ej. Abono semanal en efectivo"
                  value={movementNote}
                  onChange={(e) => setMovementNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAbonoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Confirmar Abono</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cargo Manual */}
      {isCargoModalOpen && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={22} />
              <span>Registrar Cargo Fiado Manual</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Cliente: <b>{selectedCustomer.name}</b>
            </p>

            <form onSubmit={handleProcessCargo}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Monto del Cargo ($)</label>
                <input
                  type="number"
                  step="0.50"
                  className="input-styled"
                  placeholder="0.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Productos o Motivo de la deuda</label>
                <input
                  type="text"
                  className="input-styled"
                  placeholder="Ej. 1 Kilo de Huevo y 2 Refrescos"
                  value={movementNote}
                  onChange={(e) => setMovementNote(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCargoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-danger">Confirmar Cargo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
