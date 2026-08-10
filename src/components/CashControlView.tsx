import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ArrowDownRight, 
  ArrowUpRight, 
  PlusCircle, 
  MinusCircle, 
  CheckCircle2, 
  Receipt, 
  Printer, 
  X 
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import type { CashMovement, Sale, StoreSettings } from '../data/initialProducts';

interface CashControlViewProps {
  cashMovements: CashMovement[];
  sales: Sale[];
  settings: StoreSettings;
  onAddCashMovement: (movement: CashMovement) => void;
}

export const CashControlView: React.FC<CashControlViewProps> = ({
  cashMovements,
  sales,
  settings,
  onAddCashMovement
}) => {
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out'>('out');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementConcept, setMovementConcept] = useState('');

  // Arqueo / Reconciliation State
  const [isArqueoModalOpen, setIsArqueoModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [arqueoCompleted, setArqueoCompleted] = useState(false);

  // Math Calculations for Current Shift
  const cashSalesTotal = useMemo(() => {
    return sales
      .filter(s => s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const cardSalesTotal = useMemo(() => {
    return sales
      .filter(s => s.paymentMethod === 'card')
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const transferSalesTotal = useMemo(() => {
    return sales
      .filter(s => s.paymentMethod === 'transfer')
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const fiadoSalesTotal = useMemo(() => {
    return sales
      .filter(s => s.paymentMethod === 'fiado')
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const manualEntriesTotal = useMemo(() => {
    return cashMovements
      .filter(m => m.type === 'in')
      .reduce((sum, m) => sum + m.amount, 0);
  }, [cashMovements]);

  const manualExitsTotal = useMemo(() => {
    return cashMovements
      .filter(m => m.type === 'out')
      .reduce((sum, m) => sum + m.amount, 0);
  }, [cashMovements]);

  // Expected Cash in Drawer = Initial Fund + Cash Sales + Manual Entries - Manual Outflows
  const expectedCashInDrawer = useMemo(() => {
    return settings.initialCashFund + cashSalesTotal + manualEntriesTotal - manualExitsTotal;
  }, [settings.initialCashFund, cashSalesTotal, manualEntriesTotal, manualExitsTotal]);

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0 || !movementConcept.trim()) return;

    const newMovement: CashMovement = {
      id: 'CAJ-' + Date.now(),
      date: new Date().toISOString(),
      type: movementType,
      amount,
      concept: movementConcept.trim(),
      cashier: settings.ownerName || 'Cajero'
    };

    onAddCashMovement(newMovement);
    setIsMovementModalOpen(false);
    setMovementAmount('');
    setMovementConcept('');
    soundManager.playCashRegister();
  };

  const handlePrintCut = () => {
    window.print();
  };

  return (
    <div className="view-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <DollarSign size={28} className="gradient-text-accent" />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Control de Efectivo y Caja</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fondo, gastos de operación, entradas y corte de turno</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => {
              setMovementType('out');
              setMovementAmount('');
              setMovementConcept('');
              setIsMovementModalOpen(true);
            }}
          >
            <MinusCircle size={16} style={{ color: 'var(--danger)' }} />
            <span>Registrar Salida / Gasto</span>
          </button>

          <button 
            className="btn-secondary"
            onClick={() => {
              setMovementType('in');
              setMovementAmount('');
              setMovementConcept('');
              setIsMovementModalOpen(true);
            }}
          >
            <PlusCircle size={16} style={{ color: 'var(--primary)' }} />
            <span>Entrada de Efectivo</span>
          </button>

          <button 
            className="btn-primary"
            onClick={() => {
              setCountedCash('');
              setArqueoCompleted(false);
              setIsArqueoModalOpen(true);
            }}
          >
            <Receipt size={16} />
            <span>Hacer Corte de Turno (Corte Z)</span>
          </button>
        </div>
      </div>

      {/* Main Drawer Balance Card */}
      <div className="glass" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 24, 39, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Efectivo Esperado en Caja Registradora</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, marginTop: '0.35rem' }}>
              ${expectedCashInDrawer.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Incluye fondo inicial de ${settings.initialCashFund.toFixed(2)} + ventas en efectivo - gastos
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ventas en Efectivo:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>+${cashSalesTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ventas Tarjeta / SPEI:</span>
              <span style={{ fontWeight: 700, color: '#a5b4fc' }}>+${(cardSalesTotal + transferSalesTotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ventas en Fiado:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${fiadoSalesTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gastos / Salidas de Caja:</span>
              <span style={{ fontWeight: 700, color: 'var(--danger)' }}>-${manualExitsTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div style={{ marginTop: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem' }}>
          Registro de Movimientos de Caja
        </h3>

        <div className="glass table-wrapper">
          {cashMovements.length === 0 ? (
            <div className="empty-state">
              <DollarSign size={40} />
              <h3>No hay movimientos manuales registrados</h3>
              <p>Registra gastos o entradas de dinero para mantener tu balance al centavo.</p>
            </div>
          ) : (
            <table className="table-styled">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Fecha y Hora</th>
                  <th>Concepto / Motivo</th>
                  <th>Responsable</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {cashMovements.map(m => (
                  <tr key={m.id}>
                    <td>
                      <span className={`badge-stock ${m.type === 'in' ? 'normal' : 'low'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {m.type === 'in' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        <span>{m.type === 'in' ? 'Entrada (+)' : 'Gasto / Salida (-)'}</span>
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(m.date).toLocaleString('es-MX')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.concept}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.cashier}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: m.type === 'in' ? 'var(--primary)' : 'var(--danger)' }}>
                      {m.type === 'in' ? `+$${m.amount.toFixed(2)}` : `-$${m.amount.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: New Cash Movement */}
      {isMovementModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {movementType === 'in' ? (
                <>
                  <PlusCircle size={22} style={{ color: 'var(--primary)' }} />
                  <span>Entrada de Efectivo</span>
                </>
              ) : (
                <>
                  <MinusCircle size={22} style={{ color: 'var(--danger)' }} />
                  <span>Registrar Gasto / Salida de Caja</span>
                </>
              )}
            </h3>

            <form onSubmit={handleSaveMovement}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Monto ($)</label>
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
                <label className="form-label">Concepto / Motivo</label>
                <input
                  type="text"
                  className="input-styled"
                  placeholder={movementType === 'in' ? 'Ej. Ingreso de monedas para cambio' : 'Ej. Pago a proveedor de Hielo o Pan Bimbo'}
                  value={movementConcept}
                  onChange={(e) => setMovementConcept(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsMovementModalOpen(false)}>Cancelar</button>
                <button type="submit" className={movementType === 'in' ? 'btn-primary' : 'btn-danger'}>
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Arqueo / Corte de Turno (Corte Z) */}
      {isArqueoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button 
              className="icon-btn" 
              onClick={() => setIsArqueoModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            >
              <X size={18} />
            </button>

            {!arqueoCompleted ? (
              <div>
                <h3 className="modal-title">
                  <Receipt size={22} style={{ color: 'var(--primary)' }} />
                  <span>Arqueo y Corte de Turno</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Cuenta los billetes y monedas físicos en la caja registradora e ingresa el monto total.
                </p>

                <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Fondo Inicial:</span>
                    <span>${settings.initialCashFund.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Ventas Efectivo:</span>
                    <span>+${cashSalesTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gastos/Salidas:</span>
                    <span>-${manualExitsTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <span>Efectivo Esperado:</span>
                    <span style={{ color: 'var(--primary)' }}>${expectedCashInDrawer.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Efectivo Físico Contado ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    className="input-styled"
                    placeholder="0.00"
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    required
                    autoFocus
                  />
                  {countedCash && (
                    <div style={{ marginTop: '0.65rem', fontSize: '0.9rem', fontWeight: 700, color: parseFloat(countedCash) >= expectedCashInDrawer ? 'var(--primary)' : 'var(--danger)' }}>
                      Diferencia: {(parseFloat(countedCash) - expectedCashInDrawer) >= 0 ? `+$${(parseFloat(countedCash) - expectedCashInDrawer).toFixed(2)} (Sobrante)` : `-$${Math.abs(parseFloat(countedCash) - expectedCashInDrawer).toFixed(2)} (Faltante)`}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button className="btn-secondary" onClick={() => setIsArqueoModalOpen(false)}>Cancelar</button>
                  <button 
                    className="btn-primary"
                    disabled={!countedCash}
                    onClick={() => {
                      setArqueoCompleted(true);
                      soundManager.playCashRegister();
                    }}
                  >
                    Generar Reporte de Corte
                  </button>
                </div>
              </div>
            ) : (
              /* Printable Corte Z Ticket */
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem auto' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>¡Corte de Caja Generado!</h3>
                </div>

                <div className="ticket-wrapper">
                  <div className="ticket-header">
                    <div className="ticket-store-name">{settings.storeName.toUpperCase()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>CORTE DE TURNO (CORTE Z)</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>FECHA: {new Date().toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4b5563' }}>RESPONSABLE: {settings.ownerName}</div>
                  </div>

                  <div style={{ fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>FONDO INICIAL:</span>
                      <span>${settings.initialCashFund.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>VENTAS EFECTIVO:</span>
                      <span>${cashSalesTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>VENTAS TARJETA:</span>
                      <span>${cardSalesTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>VENTAS SPEI:</span>
                      <span>${transferSalesTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>VENTAS FIADO:</span>
                      <span>${fiadoSalesTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>GASTOS / SALIDAS:</span>
                      <span>-${manualExitsTotal.toFixed(2)}</span>
                    </div>

                    <div className="ticket-divider"></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>TOTAL VENTAS DEL TURNO:</span>
                      <span>${sales.reduce((s, x) => s + x.total, 0).toFixed(2)}</span>
                    </div>

                    <div className="ticket-divider"></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>EFECTIVO ESPERADO:</span>
                      <span>${expectedCashInDrawer.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>EFECTIVO CONTADO:</span>
                      <span>${parseFloat(countedCash).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.25rem' }}>
                      <span>DIFERENCIA:</span>
                      <span>${(parseFloat(countedCash) - expectedCashInDrawer).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="ticket-footer">
                    <div>*** CIERRE DE OPERACIONES ***</div>
                    <div style={{ marginTop: '0.25rem' }}>MISCELÁNEA LICHITA ERP</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <button className="btn-secondary" onClick={handlePrintCut}>
                    <Printer size={16} />
                    <span>Imprimir Ticket</span>
                  </button>
                  <button className="btn-primary" onClick={() => setIsArqueoModalOpen(false)}>
                    <span>Finalizar</span>
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
