import React, { useState } from 'react';
import { Expense, Property, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  FileCheck,
  Building,
  Tag,
  Receipt
} from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  properties: Property[];
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenNewExpenseFromParent?: boolean;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  properties,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Expense>>({
    propertyId: '',
    category: 'comunidad',
    concept: '',
    date: new Date().toISOString().split('T')[0],
    amount: 100,
    supplier: '',
    invoiceNumber: '',
    isDeductible: true,
    notes: '',
  });

  const filteredExpenses = expenses.filter(exp => {
    const prop = properties.find(p => p.id === exp.propertyId);
    const matchesSearch = `${exp.concept} ${exp.supplier} ${prop?.name} ${exp.invoiceNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const deductibleAmount = filteredExpenses
    .filter(e => e.isDeductible)
    .reduce((sum, e) => sum + e.amount, 0);

  const openNewModal = () => {
    setFormData({
      id: 'exp-' + Date.now(),
      propertyId: properties[0]?.id || '',
      category: 'comunidad',
      concept: '',
      date: new Date().toISOString().split('T')[0],
      amount: 85,
      supplier: '',
      invoiceNumber: '',
      isDeductible: true,
      notes: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.concept || !formData.amount) return;

    const saved: Expense = {
      id: formData.id || 'exp-' + Date.now(),
      propertyId: formData.propertyId,
      category: (formData.category as ExpenseCategory) || 'otros',
      concept: formData.concept,
      date: formData.date || new Date().toISOString().split('T')[0],
      amount: Number(formData.amount) || 0,
      supplier: formData.supplier,
      invoiceNumber: formData.invoiceNumber,
      isDeductible: formData.isDeductible ?? true,
      notes: formData.notes,
    };

    onSaveExpense(saved);
    setModalOpen(false);
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'comunidad': return 'Comunidad de Propietarios';
      case 'ibi': return 'Impuesto Bienes Inmuebles (IBI)';
      case 'seguro': return 'Seguro de Hogar / Edificio';
      case 'suministros': return 'Suministros (Agua/Luz/Gas)';
      case 'mantenimiento': return 'Reparación y Conservación';
      case 'basuras': return 'Tasa de Basuras';
      case 'administracion': return 'Administración de Fincas';
      case 'hipoteca': return 'Intereses Hipotecarios';
      default: return 'Otros Gastos';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gastos y Mantenimiento</h1>
          <p className="text-sm text-slate-500">Control de cuotas de comunidad, tributos locales, seguros y partidas deducibles en el IRPF.</p>
        </div>
        <div className="flex items-center space-x-3 self-start">
          <div className="bg-rose-50 text-rose-800 px-3.5 py-2 rounded-xl border border-rose-200 text-xs font-bold flex items-center">
            <TrendingDown className="w-4 h-4 mr-1.5 text-rose-600" />
            Total Gastos: {formatCurrency(totalExpenseAmount)}
          </div>
          <button
            onClick={openNewModal}
            id="add-expense-btn"
            className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 ml-2 mr-2 shrink-0" />
          <input
            type="text"
            id="search-expenses-input"
            placeholder="Buscar por concepto o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-slate-800 focus:outline-hidden bg-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs w-full md:w-auto justify-end">
          <span className="text-slate-500 font-medium">Categoría:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
          >
            <option value="all">Todas las categorías</option>
            <option value="comunidad">Comunidad</option>
            <option value="ibi">IBI</option>
            <option value="seguro">Seguro</option>
            <option value="mantenimiento">Reparación / Mantenimiento</option>
            <option value="suministros">Suministros</option>
            <option value="basuras">Basuras</option>
            <option value="administracion">Administración</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Inmueble</th>
                <th className="py-3.5 px-4">Categoría / Concepto</th>
                <th className="py-3.5 px-4">Proveedor / Factura</th>
                <th className="py-3.5 px-4 text-center">Deducible IRPF</th>
                <th className="py-3.5 px-4 text-right">Importe</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay gastos registrados en este periodo.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const prop = properties.find(p => p.id === exp.propertyId);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {formatDate(exp.date)}
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-800">
                        {prop?.name || 'Inmueble'}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{exp.concept}</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {getCategoryLabel(exp.category)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <div>{exp.supplier || '-'}</div>
                        {exp.invoiceNumber && (
                          <div className="font-mono text-[10px] text-slate-400">Doc: {exp.invoiceNumber}</div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {exp.isDeductible ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <FileCheck className="w-3 h-3 mr-1" /> Deducible (100%)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No deducible</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-rose-600 text-sm">
                        -{formatCurrency(exp.amount)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar gasto "${exp.concept}"?`)) {
                              onDeleteExpense(exp.id);
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

      {/* Modal Alta Gasto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">Registrar Nuevo Gasto</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inmueble Afectado *</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Categoría del Gasto</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="comunidad">Comunidad de Propietarios</option>
                    <option value="ibi">IBI (Impuesto Bienes Inmuebles)</option>
                    <option value="seguro">Seguro de la Propiedad</option>
                    <option value="mantenimiento">Reparación y Conservación</option>
                    <option value="suministros">Suministros (Luz/Agua/Gas)</option>
                    <option value="basuras">Tasa de Basuras</option>
                    <option value="administracion">Honorarios Administración</option>
                    <option value="hipoteca">Intereses de Hipoteca</option>
                    <option value="otros">Otros Gastos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Concepto / Descripción *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Sustitución cerradura puerta principal"
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha del Gasto *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Importe Total (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proveedor / Empresa</label>
                  <input
                    type="text"
                    placeholder="ej. Cerrajería Central S.L."
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nº Factura / Justificante</label>
                  <input
                    type="text"
                    placeholder="ej. FAC-2025-998"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDeductible}
                    onChange={(e) => setFormData({ ...formData, isDeductible: e.target.checked })}
                    className="rounded-sm text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span>Gasto deducible en el IRPF / Impuesto de Sociedades</span>
                </label>
                <p className="text-[11px] text-slate-500 ml-6 mt-0.5">
                  Los gastos necesarios para la obtención de rendimientos son desgravables según normativa de la AEAT.
                </p>
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
                  Registrar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
