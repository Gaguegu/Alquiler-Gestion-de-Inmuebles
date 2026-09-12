import React, { useState } from 'react';
import { Contract, Property, Tenant, LandlordSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import { legalTemplates } from '../utils/legalTemplates';
import {
  Calculator,
  X,
  Printer,
  Copy,
  Check,
  Share2,
  TrendingUp,
  FileText,
  Save,
  MessageCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface IpcCalculatorModalProps {
  contracts: Contract[];
  properties: Property[];
  tenants: Tenant[];
  settings: LandlordSettings;
  preselectedContractId?: string | null;
  onClose: () => void;
  onApplyNewRent: (contractId: string, newRent: number) => void;
}

export const IpcCalculatorModal: React.FC<IpcCalculatorModalProps> = ({
  contracts,
  properties,
  tenants,
  settings,
  preselectedContractId,
  onClose,
  onApplyNewRent,
}) => {
  const activeContracts = contracts.filter((c) => c.status === 'activo');
  const [selectedContractId, setSelectedContractId] = useState<string>(
    preselectedContractId || (activeContracts[0]?.id || '')
  );
  const [ipcPercent, setIpcPercent] = useState<number>(2.5);
  const [effectiveDate, setEffectiveDate] = useState<string>(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    return nextMonth.toISOString().split('T')[0];
  });
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const selectedContract = activeContracts.find((c) => c.id === selectedContractId) || activeContracts[0];
  const selectedProperty = selectedContract ? properties.find((p) => p.id === selectedContract.propertyId) : undefined;
  const selectedTenant = selectedContract ? tenants.find((t) => t.id === selectedContract.tenantId) : undefined;

  const currentRent = selectedContract ? selectedContract.monthlyRent : 0;
  const rentIncrease = (currentRent * (ipcPercent / 100));
  const newRent = Number((currentRent + rentIncrease).toFixed(2));
  const annualDifference = rentIncrease * 12;

  // Generate legal letter
  const template = legalTemplates.find((t) => t.id === 'notificacion-ipc');
  const letterText = template
    ? template.generate({
        settings,
        property: selectedProperty,
        tenant: selectedTenant,
        contract: selectedContract,
        customData: {
          ipcPercent,
          newRent,
          effectiveDate: formatDate(effectiveDate),
        },
      })
    : '';

  const handleCopyText = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = (selectedTenant?.phone || '').replace(/[^\d+]/g, '');
    const message = `Estimado/a ${selectedTenant?.name || ''}, le adjuntamos la comunicación formal sobre la revisión anual de renta de ${selectedProperty?.name || 'su vivienda'}. Renta actual: ${formatCurrency(currentRent)}. Con el IPC (${ipcPercent}%), la nueva renta será de ${formatCurrency(newRent)}/mes a partir de ${formatDate(effectiveDate)}. Un cordial saludo.`;
    const url = phone
      ? `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleApply = () => {
    if (!selectedContract) return;
    onApplyNewRent(selectedContract.id, newRent);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Calculadora Legal de Actualización de Renta (IPC / IRAV)
              </h3>
              <p className="text-xs text-slate-400">
                Cálculo automático de la nueva renta y redacción de la notificación formal según el Art. 18 de la LAU
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-slate-50/50">
          {/* Top Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
            {/* Contract Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Seleccionar Contrato Activo *</label>
              <select
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
              >
                {activeContracts.map((c) => {
                  const prop = properties.find((p) => p.id === c.propertyId);
                  const ten = tenants.find((t) => t.id === c.tenantId);
                  return (
                    <option key={c.id} value={c.id}>
                      {prop?.name || 'Inmueble'} — {ten?.name || 'Inquilino'} ({formatCurrency(c.monthlyRent)}/mes)
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Mes revisión fijado: <strong className="text-slate-700">{selectedContract?.ipcUpdateMonth || 'Anual'}</strong>
              </p>
            </div>

            {/* IPC % Input & Presets */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Índice / Variación IPC (%) *</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={ipcPercent}
                  onChange={(e) => setIpcPercent(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                />
                <div className="flex items-center space-x-1">
                  {[2.0, 2.5, 3.0, 3.5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setIpcPercent(val)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                        ipcPercent === val ? 'bg-[#0b4f8a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Límite oficial anual establecido por Ley 12/2023</p>
            </div>

            {/* Effective Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Fecha de Efectividad (Preaviso 30d)</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 text-amber-500 mr-1" />
                Obligatorio notificar 1 mes antes
              </p>
            </div>
          </div>

          {/* Results Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-sky-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm no-print">
            <div>
              <p className="text-slate-400 text-[11px] uppercase font-semibold">Renta Actual</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(currentRent)}</p>
            </div>
            <div>
              <p className="text-sky-300 text-[11px] uppercase font-semibold">Variación IPC</p>
              <p className="text-xl font-bold text-sky-400 mt-0.5">+{ipcPercent}%</p>
            </div>
            <div>
              <p className="text-emerald-300 text-[11px] uppercase font-semibold">Subida Mensual</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">+{formatCurrency(rentIncrease)}</p>
              <p className="text-[10px] text-slate-300">+{formatCurrency(annualDifference)}/año</p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
              <p className="text-amber-300 text-[11px] uppercase font-bold">Nueva Renta Mensual</p>
              <p className="text-2xl font-black text-white mt-0.5">{formatCurrency(newRent)}</p>
            </div>
          </div>

          {appliedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center space-x-2 text-xs font-bold no-print">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>¡La renta del contrato y del inmueble se ha actualizado a {formatCurrency(newRent)}/mes con éxito!</span>
            </div>
          )}

          {/* Legal Notice Document Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-200 gap-3 no-print">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#0b4f8a]" />
                <h4 className="font-bold text-slate-900 text-sm">Notificación Preceptiva Oficial (Art. 18 LAU)</h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleApply}
                  id="apply-ipc-rent-btn"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
                  title="Actualiza la renta del contrato y del inmueble directamente"
                >
                  <Save className="w-4 h-4" />
                  <span>Aplicar al Contrato</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0b4f8a] rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-slate-50 p-6 rounded-xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-200 max-h-[350px] overflow-y-auto">
              {letterText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between no-print">
          <p className="text-[11px] text-slate-500">
            Conforme a la Ley 29/1994 (LAU) y Ley 12/2023 por el derecho a la vivienda.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
