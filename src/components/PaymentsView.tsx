import React, { useState } from 'react';
import { Payment, Property, Tenant, PaymentMethod, PaymentStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Building,
  User,
  X,
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface PaymentsViewProps {
  payments: Payment[];
  properties: Property[];
  tenants: Tenant[];
  onSavePayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  properties,
  tenants,
  onSavePayment,
  onDeletePayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Payment>>({
    propertyId: '',
    tenantId: '',
    date: new Date().toISOString().split('T')[0],
    amount: 1000,
    paymentMethod: 'transferencia',
    status: 'cobrado',
    reference: '',
    notes: '',
  });

  const filteredPayments = payments.filter(pay => {
    const prop = properties.find(p => p.id === pay.propertyId);
    const ten = tenants.find(t => t.id === pay.tenantId);
    const text = `${prop?.name} ${ten?.name} ${pay.reference} ${pay.notes}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const totalCollected = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  const openNewModal = () => {
    const firstProp = properties[0];
    setFormData({
      id: 'pay-' + Date.now(),
      propertyId: firstProp?.id || '',
      tenantId: tenants[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      amount: firstProp?.currentRent || 1000,
      paymentMethod: 'transferencia',
      status: 'cobrado',
      reference: 'TRF-' + Math.floor(100000 + Math.random() * 900000),
      notes: 'Cobro de renta mensual.',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.tenantId) return;

    const saved: Payment = {
      id: formData.id || 'pay-' + Date.now(),
      invoiceId: formData.invoiceId,
      propertyId: formData.propertyId,
      tenantId: formData.tenantId,
      date: formData.date || new Date().toISOString().split('T')[0],
      amount: Number(formData.amount) || 0,
      paymentMethod: (formData.paymentMethod as PaymentMethod) || 'transferencia',
      status: (formData.status as PaymentStatus) || 'cobrado',
      reference: formData.reference,
      notes: formData.notes,
    };

    onSavePayment(saved);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Cobros</h1>
          <p className="text-sm text-slate-500">Histórico de ingresos bancarios, transferencias, domiciliaciones SEPA y justificantes.</p>
        </div>
        <div className="flex items-center space-x-3 self-start">
          <div className="bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-bold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
            Total Liquidado: {formatCurrency(totalCollected)}
          </div>
          <button
            onClick={openNewModal}
            id="register-payment-btn"
            className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Cobro</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center">
        <Search className="w-4 h-4 text-slate-400 ml-2 mr-3" />
        <input
          type="text"
          id="search-payments-input"
          placeholder="Buscar por referencia bancaria, inquilino o inmueble..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-hidden bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Fecha de Abono</th>
                <th className="py-3.5 px-4">Inmueble / Inquilino</th>
                <th className="py-3.5 px-4">Método y Referencia</th>
                <th className="py-3.5 px-4">Notas / Concepto</th>
                <th className="py-3.5 px-4 text-right">Importe Cobrado</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay cobros registrados con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => {
                  const prop = properties.find(p => p.id === pay.propertyId);
                  const ten = tenants.find(t => t.id === pay.tenantId);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {formatDate(pay.date)}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{prop?.name || 'Inmueble'}</div>
                        <div className="text-slate-500 text-[11px]">{ten?.name || 'Inquilino'}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="capitalize font-medium text-slate-800">{pay.paymentMethod}</span>
                        {pay.reference && (
                          <div className="font-mono text-[10px] text-slate-400">{pay.reference}</div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                        {pay.notes || '-'}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-emerald-700 text-sm">
                        +{formatCurrency(pay.amount)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Cobrado
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar este registro de cobro?')) {
                              onDeletePayment(pay.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Alta Cobro */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">Registrar Entrada de Cobro</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inmueble *</label>
                  <select
                    required
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inquilino *</label>
                  <select
                    required
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha del Ingreso *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Importe Recibido (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medio de Pago</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="domiciliacion">Remesa SEPA</option>
                    <option value="bizum">Bizum</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referencia / Justificante</label>
                  <input
                    type="text"
                    placeholder="ej. TRF-128490"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el cobro..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  Guardar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
