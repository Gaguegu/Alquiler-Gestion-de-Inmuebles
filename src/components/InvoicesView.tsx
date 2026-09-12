import React, { useState } from 'react';
import {
  Invoice,
  Property,
  Tenant,
  Contract,
  LandlordSettings,
  InvoiceType,
  PaymentStatus,
  PaymentMethod,
} from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import {
  Receipt,
  Plus,
  Zap,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  FileCode2
} from 'lucide-react';

interface InvoicesViewProps {
  invoices: Invoice[];
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  settings: LandlordSettings;
  onSaveInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onOpenPrintModal: (invoice: Invoice) => void;
  onMassGenerateReceipts: () => void;
  onOpenSepaRemittance?: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  properties,
  tenants,
  contracts,
  settings,
  onSaveInvoice,
  onDeleteInvoice,
  onMarkAsPaid,
  onOpenPrintModal,
  onMassGenerateReceipts,
  onOpenSepaRemittance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Form Data
  const [formData, setFormData] = useState<Partial<Invoice>>({
    type: 'recibo',
    propertyId: '',
    tenantId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    concept: '',
    baseAmount: 1000,
    vatPercent: 0,
    retentionPercent: 0,
    status: 'pendiente',
    paymentMethod: 'transferencia',
    notes: '',
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.concept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openNewModal = () => {
    setEditingInvoice(null);
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 5);

    const firstProp = properties[0];
    const contract = contracts.find(c => c.propertyId === firstProp?.id && c.status === 'activo');
    const tenantId = contract ? contract.tenantId : (tenants[0]?.id || '');
    const isCommercial = firstProp?.type === 'local' || firstProp?.type === 'oficina';

    const vat = isCommercial ? 21 : 0;
    const ret = isCommercial ? 19 : 0;
    const base = contract ? contract.monthlyRent : 1000;

    const nextSeq = isCommercial ? settings.nextInvoiceSeq : settings.nextReceiptSeq;
    const prefix = isCommercial ? settings.invoicePrefix : settings.receiptPrefix;
    const num = `${prefix}${String(nextSeq).padStart(3, '0')}`;

    setFormData({
      id: 'inv-' + Date.now(),
      number: num,
      type: isCommercial ? 'factura' : 'recibo',
      propertyId: firstProp?.id || '',
      tenantId: tenantId,
      contractId: contract?.id,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      concept: `Renta mensual alquiler - ${today.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`,
      baseAmount: base,
      vatPercent: vat,
      retentionPercent: ret,
      status: 'pendiente',
      paidAmount: 0,
      paymentMethod: 'transferencia',
      notes: isCommercial ? 'Operación sujeta a IVA y con retención legal.' : 'Operación exenta de IVA según Art. 20 Ley 37/1992.',
    });
    setModalOpen(true);
  };

  const openEditModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setFormData({ ...inv });
    setModalOpen(true);
  };

  // Recalculate VAT and Retention Amounts
  const base = Number(formData.baseAmount) || 0;
  const vatP = Number(formData.vatPercent) || 0;
  const retP = Number(formData.retentionPercent) || 0;
  const vatAmount = (base * vatP) / 100;
  const retAmount = (base * retP) / 100;
  const totalAmount = base + vatAmount - retAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.tenantId || !formData.number) return;

    const saved: Invoice = {
      id: editingInvoice ? editingInvoice.id : (formData.id || 'inv-' + Date.now()),
      number: formData.number || 'REC-000',
      type: (formData.type as InvoiceType) || 'recibo',
      propertyId: formData.propertyId,
      tenantId: formData.tenantId,
      contractId: formData.contractId,
      issueDate: formData.issueDate || '',
      dueDate: formData.dueDate || '',
      concept: formData.concept || 'Renta mensual',
      baseAmount: base,
      vatPercent: vatP,
      vatAmount: vatAmount,
      retentionPercent: retP,
      retentionAmount: retAmount,
      totalAmount: totalAmount,
      status: (formData.status as PaymentStatus) || 'pendiente',
      paidAmount: formData.status === 'cobrado' ? totalAmount : (Number(formData.paidAmount) || 0),
      paymentMethod: (formData.paymentMethod as PaymentMethod) || 'transferencia',
      notes: formData.notes,
    };

    onSaveInvoice(saved);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Facturación y Recibos</h1>
          <p className="text-sm text-slate-500">Emisión de recibos de viviendas exentos de IVA y facturas de locales con IRPF e IVA.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          {onOpenSepaRemittance && (
            <button
              onClick={onOpenSepaRemittance}
              id="open-sepa-btn"
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center space-x-1.5"
              title="Generar fichero XML SEPA (Norma 19 / pain.008) para domiciliar recibos en banca online"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Remesa SEPA (XML)</span>
            </button>
          )}
          <button
            onClick={onMassGenerateReceipts}
            id="mass-generate-receipts-btn"
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
            title="Genera automáticamente los recibos del mes para todos los contratos activos"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Generar Recibos del Mes</span>
          </button>
          <button
            onClick={openNewModal}
            id="create-invoice-btn"
            className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Recibo / Factura</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 ml-2 mr-2 shrink-0" />
          <input
            type="text"
            id="search-invoices-input"
            placeholder="Buscar por número o concepto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-slate-800 focus:outline-hidden bg-transparent"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <option value="all">Todos</option>
              <option value="recibo">Recibos</option>
              <option value="factura">Facturas</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <option value="all">Todos los estados</option>
              <option value="cobrado">Cobrado</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Número / Tipo</th>
                <th className="py-3.5 px-4">Inmueble e Inquilino</th>
                <th className="py-3.5 px-4">Fecha Emisión / Venc.</th>
                <th className="py-3.5 px-4 text-right">Base</th>
                <th className="py-3.5 px-4 text-right">Impuestos</th>
                <th className="py-3.5 px-4 text-right">Total Líquido</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron recibos o facturas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const prop = properties.find(p => p.id === inv.propertyId);
                  const ten = tenants.find(t => t.id === inv.tenantId);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                            inv.type === 'recibo' ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {inv.type}
                          </span>
                          <span>{inv.number}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5">
                          {inv.concept}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">{prop?.name || 'Inmueble'}</div>
                        <div className="text-slate-500 text-[11px]">{ten?.name || 'Inquilino'}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div>{formatDate(inv.issueDate)}</div>
                        <div className="text-[11px] text-slate-400">Vence: {formatDate(inv.dueDate)}</div>
                      </td>

                      <td className="py-4 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(inv.baseAmount)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {inv.vatPercent > 0 && (
                          <div className="text-slate-600 text-[11px]">
                            IVA ({inv.vatPercent}%): +{formatCurrency(inv.vatAmount)}
                          </div>
                        )}
                        {inv.retentionPercent > 0 && (
                          <div className="text-rose-600 text-[11px]">
                            Ret. ({inv.retentionPercent}%): -{formatCurrency(inv.retentionAmount)}
                          </div>
                        )}
                        {inv.vatPercent === 0 && inv.retentionPercent === 0 && (
                          <span className="text-[11px] text-slate-400">Exento IVA</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(inv.totalAmount)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {inv.status === 'cobrado' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Cobrado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" /> Pendiente
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {inv.status !== 'cobrado' && (
                            <button
                              onClick={() => onMarkAsPaid(inv.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] flex items-center space-x-1"
                              title="Marcar como cobrado y registrar ingreso"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Cobrar</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenPrintModal(inv)}
                            className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg"
                            title="Ver e imprimir documento oficial"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            title="Editar factura"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar ${inv.type} ${inv.number}?`)) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar factura"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Alta / Edición de Factura o Recibo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">
                {editingInvoice ? 'Editar Documento' : 'Emitir Factura o Recibo'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value as InvoiceType;
                      setFormData({
                        ...formData,
                        type: newType,
                        vatPercent: newType === 'factura' ? 21 : 0,
                        retentionPercent: newType === 'factura' ? 19 : 0,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="recibo">Recibo de Alquiler (Vivienda)</option>
                    <option value="factura">Factura Comercial (Local/Oficina)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número de Serie *</label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inmueble *</label>
                  <select
                    required
                    value={formData.propertyId}
                    onChange={(e) => {
                      const prop = properties.find(p => p.id === e.target.value);
                      const cont = contracts.find(c => c.propertyId === prop?.id && c.status === 'activo');
                      const isCom = prop?.type === 'local' || prop?.type === 'oficina';
                      setFormData({
                        ...formData,
                        propertyId: e.target.value,
                        tenantId: cont ? cont.tenantId : formData.tenantId,
                        contractId: cont?.id,
                        baseAmount: cont ? cont.monthlyRent : (prop?.currentRent || formData.baseAmount),
                        vatPercent: isCom ? 21 : 0,
                        retentionPercent: isCom ? 19 : 0,
                        type: isCom ? 'factura' : 'recibo',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inquilino / Pagador *</label>
                  <select
                    required
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.dniNie})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Concepto *</label>
                <input
                  type="text"
                  required
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Emisión</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Fiscal calculation boxes */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base Imponible (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.baseAmount}
                      onChange={(e) => setFormData({ ...formData, baseAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">IVA (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.vatPercent}
                      onChange={(e) => setFormData({ ...formData, vatPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Retención IRPF (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.retentionPercent}
                      onChange={(e) => setFormData({ ...formData, retentionPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-slate-600">
                    Base: <strong>{formatCurrency(base)}</strong>
                    {vatP > 0 && ` + IVA (${vatP}%): ${formatCurrency(vatAmount)}`}
                    {retP > 0 && ` - Retención (${retP}%): ${formatCurrency(retAmount)}`}
                  </span>
                  <div className="text-right">
                    <span className="text-xs uppercase text-slate-400 font-bold block">Total a Cobrar</span>
                    <span className="text-base font-black text-[#0b4f8a]">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Forma de Pago</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="domiciliacion">Domiciliación SEPA</option>
                    <option value="bizum">Bizum</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado del Cobro</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="cobrado">Cobrado</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
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
                  {editingInvoice ? 'Guardar Cambios' : 'Emitir Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
