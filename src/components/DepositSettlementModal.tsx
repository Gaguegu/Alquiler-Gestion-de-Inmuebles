import React, { useState } from 'react';
import { Contract, Property, Tenant, LandlordSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import { legalTemplates } from '../utils/legalTemplates';
import {
  KeyRound,
  X,
  Plus,
  Trash2,
  Printer,
  Copy,
  Check,
  Building,
  User,
  Calculator,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface DepositSettlementModalProps {
  contracts: Contract[];
  properties: Property[];
  tenants: Tenant[];
  settings: LandlordSettings;
  preselectedContractId?: string | null;
  onClose: () => void;
}

interface DeductionItem {
  id: string;
  concept: string;
  category: 'suministros' | 'desperfectos' | 'limpieza' | 'rentas' | 'otro';
  amount: number;
}

export const DepositSettlementModal: React.FC<DepositSettlementModalProps> = ({
  contracts,
  properties,
  tenants,
  settings,
  preselectedContractId,
  onClose,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(
    preselectedContractId || (contracts[0]?.id || '')
  );

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];
  const selectedProperty = selectedContract
    ? properties.find((p) => p.id === selectedContract.propertyId)
    : undefined;
  const selectedTenant = selectedContract
    ? tenants.find((t) => t.id === selectedContract.tenantId)
    : undefined;

  const depositLegal = selectedContract?.deposit || 0;
  const depositExtra = selectedContract?.additionalDeposit || 0;
  const totalDepositReceived = depositLegal + depositExtra;

  const [deductions, setDeductions] = useState<DeductionItem[]>([
    {
      id: 'ded-1',
      concept: 'Lectura final suministros de agua y luz estimada',
      category: 'suministros',
      amount: 95,
    },
  ]);

  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState<DeductionItem['category']>('desperfectos');
  const [newAmount, setNewAmount] = useState<number>(50);
  const [copied, setCopied] = useState(false);

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || newAmount <= 0) return;
    setDeductions((prev) => [
      ...prev,
      {
        id: 'ded-' + Date.now(),
        concept: newConcept.trim(),
        category: newCategory,
        amount: newAmount,
      },
    ]);
    setNewConcept('');
    setNewAmount(50);
  };

  const handleRemoveDeduction = (id: string) => {
    setDeductions((prev) => prev.filter((d) => d.id !== id));
  };

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netRefund = totalDepositReceived - totalDeductions;
  const isRefund = netRefund >= 0;

  // Generate legal settlement text
  const template = legalTemplates.find((t) => t.id === 'finiquito-fianza');
  const deductionsDetailText = deductions
    .map((d) => `- [${d.category.toUpperCase()}] ${d.concept}: ${formatCurrency(d.amount)}`)
    .join('\n');

  const settlementText = template
    ? template.generate({
        settings,
        property: selectedProperty,
        tenant: selectedTenant,
        contract: selectedContract,
        customData: {
          deductionsTotal: totalDeductions,
          deductionsDetail: deductionsDetailText || '- Sin deducciones ni desperfectos apreciados.',
        },
      })
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(settlementText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Liquidación de Fianza y Check-out (Finiquito de Arrendamiento)
              </h3>
              <p className="text-xs text-slate-400">
                Cálculo de deducciones por suministros o daños y acta oficial de entrega de llaves
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-slate-50/50">
          {/* Contract Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
            <label className="block font-semibold text-slate-700 mb-1.5">Seleccionar Contrato a Liquidar *</label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
            >
              {contracts.map((c) => {
                const prop = properties.find((p) => p.id === c.propertyId);
                const ten = tenants.find((t) => t.id === c.tenantId);
                return (
                  <option key={c.id} value={c.id}>
                    {prop?.name || 'Inmueble'} · {ten?.name || 'Inquilino'} (Fianza total: {formatCurrency((c.deposit || 0) + (c.additionalDeposit || 0))})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Balance Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Fianzas Depositadas</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalDepositReceived)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Legal: {formatCurrency(depositLegal)} · Adicional: {formatCurrency(depositExtra)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-500 uppercase">Total Deducciones</span>
              <p className="text-xl font-bold text-rose-600 mt-1">-{formatCurrency(totalDeductions)}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{deductions.length} conceptos descontados</p>
            </div>

            <div className={`p-4 rounded-2xl border ${isRefund ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {isRefund ? 'Saldo a Devolver al Inquilino' : 'Deuda a Reclamar al Inquilino'}
              </span>
              <p className="text-2xl font-black mt-1">
                {formatCurrency(Math.abs(netRefund))}
              </p>
              <p className="text-[11px] font-medium opacity-80 mt-0.5">
                {isRefund ? 'A transferir en cuenta en plazo legal' : 'Supera la fianza constituida'}
              </p>
            </div>
          </div>

          {/* Deductions List & Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 no-print">
            <h4 className="font-bold text-slate-900 text-sm">Conceptos a Deducir de la Fianza</h4>

            {/* List */}
            <div className="space-y-2">
              {deductions.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold text-[10px] uppercase">
                      {d.category}
                    </span>
                    <span className="font-medium text-slate-800">{d.concept}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900">{formatCurrency(d.amount)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeduction(d.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Quitar deducción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Deduction Form */}
            <form onSubmit={handleAddDeduction} className="flex flex-col sm:flex-row items-end gap-3 pt-3 border-t border-slate-100">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Concepto / Motivo</label>
                <input
                  type="text"
                  placeholder="ej. Factura pendiente luz último mes, pintar pared salón..."
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DeductionItem['category'])}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="suministros">Suministros</option>
                  <option value="desperfectos">Desperfectos</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="rentas">Rentas impagadas</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Importe (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir</span>
              </button>
            </form>
          </div>

          {/* Legal Finiquito Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 no-print">
              <h4 className="font-bold text-slate-900 text-sm">Documento Oficial de Finiquito y Devolución</h4>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-200 max-h-[300px] overflow-y-auto">
              {settlementText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between no-print">
          <p className="text-[11px] text-slate-500">
            Conforme a las disposiciones del Art. 36 de la LAU y criterios jurisprudenciales sobre fianza arrendaticia.
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
