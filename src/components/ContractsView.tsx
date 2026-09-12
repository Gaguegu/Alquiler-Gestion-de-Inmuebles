import React, { useState } from 'react';
import { Contract, Property, Tenant, ContractStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import {
  FileSignature,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  X,
  Building,
  User,
  ShieldAlert,
  Calculator,
  KeyRound,
  FileText,
  Scale
} from 'lucide-react';

interface ContractsViewProps {
  contracts: Contract[];
  properties: Property[];
  tenants: Tenant[];
  onSaveContract: (contract: Contract) => void;
  onDeleteContract: (id: string) => void;
  onOpenIpcCalculator?: (contractId?: string) => void;
  onOpenDepositSettlement?: (contractId?: string) => void;
  onOpenLegalTemplates?: () => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  properties,
  tenants,
  onSaveContract,
  onDeleteContract,
  onOpenIpcCalculator,
  onOpenDepositSettlement,
  onOpenLegalTemplates,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const [formData, setFormData] = useState<Partial<Contract>>({
    propertyId: '',
    tenantId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlyRent: 1000,
    deposit: 1000,
    additionalDeposit: 0,
    paymentDay: 5,
    ipcUpdateMonth: 'Enero',
    status: 'activo',
    notes: '',
  });

  const openNewModal = () => {
    setEditingContract(null);
    const firstProp = properties[0]?.id || '';
    const firstTen = tenants[0]?.id || '';
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    setFormData({
      id: 'cont-' + Date.now(),
      propertyId: firstProp,
      tenantId: firstTen,
      startDate: today.toISOString().split('T')[0],
      endDate: nextYear.toISOString().split('T')[0],
      monthlyRent: 1000,
      deposit: 1000,
      additionalDeposit: 0,
      paymentDay: 5,
      ipcUpdateMonth: 'Enero',
      status: 'activo',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (c: Contract) => {
    setEditingContract(c);
    setFormData({ ...c });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.tenantId) return;

    const saved: Contract = {
      id: editingContract ? editingContract.id : (formData.id || 'cont-' + Date.now()),
      propertyId: formData.propertyId,
      tenantId: formData.tenantId,
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      monthlyRent: Number(formData.monthlyRent) || 0,
      deposit: Number(formData.deposit) || 0,
      additionalDeposit: Number(formData.additionalDeposit) || 0,
      paymentDay: Number(formData.paymentDay) || 5,
      ipcUpdateMonth: formData.ipcUpdateMonth || 'Enero',
      status: (formData.status as ContractStatus) || 'activo',
      notes: formData.notes || '',
    };

    onSaveContract(saved);
    setModalOpen(false);
  };

  // Helper to calculate days until contract ends
  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contratos de Arrendamiento</h1>
          <p className="text-sm text-slate-500">Supervisión de plazos legales, fianzas depositadas, fechas de renovación y actualización de IPC.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          {onOpenIpcCalculator && (
            <button
              onClick={() => onOpenIpcCalculator()}
              id="open-ipc-modal-btn"
              className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-[#0b4f8a] border border-sky-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-2xs"
              title="Calcular revisión anual de renta según Art. 18 LAU"
            >
              <Calculator className="w-4 h-4" />
              <span>Calcular IPC</span>
            </button>
          )}

          {onOpenDepositSettlement && (
            <button
              onClick={() => onOpenDepositSettlement()}
              id="open-deposit-modal-btn"
              className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-2xs"
              title="Liquidar finiquito, fianza y entrega de llaves"
            >
              <KeyRound className="w-4 h-4" />
              <span>Liquidar Fianza</span>
            </button>
          )}

          {onOpenLegalTemplates && (
            <button
              onClick={onOpenLegalTemplates}
              id="open-legal-templates-btn"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
              title="Ver modelos oficiales de contrato y documentos LAU"
            >
              <Scale className="w-4 h-4" />
              <span>Modelos LAU</span>
            </button>
          )}

          <button
            onClick={openNewModal}
            id="add-contract-btn"
            className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contrato</span>
          </button>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Inmueble / Inquilino</th>
                <th className="py-3.5 px-4">Vigencia y Plazo</th>
                <th className="py-3.5 px-4 text-right">Renta Mensual</th>
                <th className="py-3.5 px-4">Fianzas Depositadas</th>
                <th className="py-3.5 px-4">Día Cobro / IPC</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay contratos registrados. Haz clic en "Nuevo Contrato" para comenzar.
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => {
                  const prop = properties.find(p => p.id === contract.propertyId);
                  const ten = tenants.find(t => t.id === contract.tenantId);
                  const daysLeft = getDaysRemaining(contract.endDate);
                  const isExpiringSoon = daysLeft > 0 && daysLeft <= 90;
                  const isExpired = daysLeft <= 0;

                  return (
                    <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{prop?.name || 'Inmueble'}</div>
                        <div className="text-slate-500 flex items-center mt-0.5">
                          <User className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{ten?.name || 'Inquilino'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800">
                          {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                        </div>
                        <div className="mt-1">
                          {isExpired ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                              <ShieldAlert className="w-3 h-3 mr-1" /> Vencido
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 mr-1" /> Vence en {daysLeft} días
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {Math.round(daysLeft / 30)} meses restantes
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(contract.monthlyRent)}
                        <span className="text-[10px] text-slate-400 block font-normal">/mes</span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-slate-800 font-medium">
                          Legal: <strong>{formatCurrency(contract.deposit)}</strong>
                        </div>
                        {contract.additionalDeposit ? (
                          <div className="text-[11px] text-slate-500">
                            Garantía: {formatCurrency(contract.additionalDeposit)}
                          </div>
                        ) : null}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <div>Día {contract.paymentDay} de cada mes</div>
                        {contract.ipcUpdateMonth && (
                          <div className="text-[11px] text-slate-400">Rev: {contract.ipcUpdateMonth}</div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                          contract.status === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : contract.status === 'proximo_vencimiento'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {contract.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {onOpenIpcCalculator && contract.status === 'activo' && (
                            <button
                              onClick={() => onOpenIpcCalculator(contract.id)}
                              className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
                              title="Calcular revisión de renta por IPC para este contrato"
                            >
                              <Calculator className="w-4 h-4" />
                            </button>
                          )}
                          {onOpenDepositSettlement && (
                            <button
                              onClick={() => onOpenDepositSettlement(contract.id)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Liquidar fianza y check-out de este contrato"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(contract)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            title="Editar contrato"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar este contrato?')) {
                                onDeleteContract(contract.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Eliminar contrato"
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

      {/* Modal Alta / Edición de Contrato */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">
                {editingContract ? 'Editar Contrato' : 'Nuevo Contrato de Alquiler'}
              </h3>
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
                    onChange={(e) => {
                      const sel = properties.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        propertyId: e.target.value,
                        monthlyRent: sel?.currentRent || formData.monthlyRent,
                        deposit: sel?.currentRent || formData.deposit,
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
                  <label className="block font-semibold text-slate-700 mb-1">Inquilino *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Fin / Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Renta Mensual (€) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fianza Legal (€)</label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Garantía Adicional (€)</label>
                  <input
                    type="number"
                    value={formData.additionalDeposit}
                    onChange={(e) => setFormData({ ...formData, additionalDeposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Día de Cobro Pactado</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDay}
                    onChange={(e) => setFormData({ ...formData, paymentDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mes Revisión IPC</label>
                  <input
                    type="text"
                    value={formData.ipcUpdateMonth}
                    onChange={(e) => setFormData({ ...formData, ipcUpdateMonth: e.target.value })}
                    placeholder="ej. Julio"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="activo">Activo</option>
                    <option value="proximo_vencimiento">Próximo Vencimiento</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cláusulas / Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre fianza en organismo oficial, suministros, inventario..."
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
                  {editingContract ? 'Guardar Cambios' : 'Registrar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
