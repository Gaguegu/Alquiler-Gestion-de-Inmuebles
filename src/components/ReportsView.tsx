import React, { useState } from 'react';
import { AppState, Property } from '../types';
import { formatCurrency, exportToCsv } from '../utils/storage';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Building2,
  FileText,
  Percent,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ReportsViewProps {
  state: AppState;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ state }) => {
  const { properties, invoices, expenses, payments } = state;
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  // Property Yield Table Calculation
  const propertyReport = properties.map((prop) => {
    const propInvoices = invoices.filter(i => i.propertyId === prop.id);
    const propExpenses = expenses.filter(e => e.propertyId === prop.id);

    const grossIncome = propInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalExpenses = propExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossIncome - totalExpenses;
    const margin = grossIncome > 0 ? ((netProfit / grossIncome) * 100).toFixed(1) : '0';

    return {
      property: prop,
      grossIncome,
      totalExpenses,
      netProfit,
      margin,
    };
  });

  const totalGrossIncome = propertyReport.reduce((acc, r) => acc + r.grossIncome, 0);
  const totalExpenses = propertyReport.reduce((acc, r) => acc + r.totalExpenses, 0);
  const totalNetProfit = totalGrossIncome - totalExpenses;

  // Fiscal calculations
  const commercialInvoices = invoices.filter(i => i.type === 'factura');
  const totalVatRepercutido = commercialInvoices.reduce((sum, i) => sum + i.vatAmount, 0);
  const totalRetentionRetenida = commercialInvoices.reduce((sum, i) => sum + i.retentionAmount, 0);
  const totalDeductibleExpenses = expenses
    .filter(e => e.isDeductible)
    .reduce((sum, e) => sum + e.amount, 0);

  // CSV Export functions
  const handleExportInvoicesCsv = () => {
    const rows = [
      ['Numero', 'Tipo', 'Inmueble_ID', 'Fecha_Emision', 'Fecha_Vencimiento', 'Base_Imponible', 'IVA_Percent', 'IVA_Importe', 'Retencion_Percent', 'Retencion_Importe', 'Total_Liquido', 'Estado', 'Forma_Pago'],
      ...invoices.map(i => [
        i.number,
        i.type,
        i.propertyId,
        i.issueDate,
        i.dueDate,
        i.baseAmount,
        i.vatPercent,
        i.vatAmount,
        i.retentionPercent,
        i.retentionAmount,
        i.totalAmount,
        i.status,
        i.paymentMethod,
      ]),
    ];
    exportToCsv('ansama_facturas_recibos', rows);
  };

  const handleExportExpensesCsv = () => {
    const rows = [
      ['Fecha', 'Inmueble_ID', 'Categoria', 'Concepto', 'Proveedor', 'Factura', 'Importe', 'Deducible_IRPF'],
      ...expenses.map(e => [
        e.date,
        e.propertyId,
        e.category,
        e.concept,
        e.supplier || '',
        e.invoiceNumber || '',
        e.amount,
        e.isDeductible ? 'SI' : 'NO',
      ]),
    ];
    exportToCsv('ansama_gastos_inmuebles', rows);
  };

  const handleExportSummaryCsv = () => {
    const rows = [
      ['Inmueble', 'Tipo', 'Superficie_M2', 'Estado', 'Renta_Mensual', 'Ingresos_Brutos', 'Gastos_Totales', 'Beneficio_Neto', 'Margen_Percent'],
      ...propertyReport.map(r => [
        r.property.name,
        r.property.type,
        r.property.surfaceM2,
        r.property.status,
        r.property.currentRent,
        r.grossIncome,
        r.totalExpenses,
        r.netProfit,
        r.margin + '%',
      ]),
    ];
    exportToCsv('ansama_resumen_rentabilidad', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Informes Financieros y Fiscales</h1>
          <p className="text-sm text-slate-500">Rentabilidad neta por inmueble, liquidación de IVA (Mod. 303), retenciones y exportaciones.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            onClick={handleExportSummaryCsv}
            id="export-summary-csv-btn"
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Resumen Inmuebles (CSV)</span>
          </button>
          <button
            onClick={handleExportInvoicesCsv}
            id="export-invoices-csv-btn"
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Facturas (CSV)</span>
          </button>
          <button
            onClick={handleExportExpensesCsv}
            id="export-expenses-csv-btn"
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Gastos (CSV)</span>
          </button>
        </div>
      </div>

      {/* Global Totals Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Ingresos Brutos Facturados</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(totalGrossIncome)}</p>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Cartera de {properties.length} inmuebles
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Gastos Operativos</p>
          <p className="text-2xl font-bold text-rose-600 tracking-tight">{formatCurrency(totalExpenses)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Deducibles AEAT: <strong>{formatCurrency(totalDeductibleExpenses)}</strong>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Rendimiento Neto Operativo</p>
          <p className="text-2xl font-bold text-[#0b4f8a] tracking-tight">{formatCurrency(totalNetProfit)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Margen de explotación: <strong>{totalGrossIncome > 0 ? ((totalNetProfit / totalGrossIncome) * 100).toFixed(1) : 0}%</strong>
          </p>
        </div>
      </div>

      {/* Property Profitability Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Rentabilidad Detallada por Inmueble</h3>
            <p className="text-xs text-slate-500">Cálculo de ingresos, costes y margen neto por unidad inmobiliaria.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3 px-4">Inmueble</th>
                <th className="py-3 px-4">Tipo / Sup.</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Ingresos Brutos</th>
                <th className="py-3 px-4 text-right">Gastos Totales</th>
                <th className="py-3 px-4 text-right">Beneficio Neto</th>
                <th className="py-3 px-4 text-right">Margen Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {propertyReport.map((rep) => (
                <tr key={rep.property.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {rep.property.name}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-500">
                    {rep.property.type} · {rep.property.surfaceM2} m²
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      rep.property.status === 'alquilado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {rep.property.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                    {formatCurrency(rep.grossIncome)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-rose-600 font-semibold">
                    -{formatCurrency(rep.totalExpenses)}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-bold text-sm ${rep.netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                    {formatCurrency(rep.netProfit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#0b4f8a]">
                    {rep.margin}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax & Fiscal Breakdown (Agencia Tributaria - AEAT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IVA Repercutido (Modelo 303) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              303
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">IVA Repercutido (Modelo 303 Trimestral)</h3>
              <p className="text-xs text-slate-500">Liquidación de IVA devengado en arrendamientos de locales y oficinas.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Base Imponible sujeta a IVA (21%):</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(commercialInvoices.reduce((acc, i) => acc + i.baseAmount, 0))}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Facturas comerciales emitidas:</span>
              <span className="font-semibold text-slate-900">{commercialInvoices.length} facturas</span>
            </div>
            <div className="flex justify-between py-2 pt-3 font-bold text-sm text-slate-900">
              <span>Cuota IVA a liquidar (Casilla 03 Mod. 303):</span>
              <span className="text-indigo-700">{formatCurrency(totalVatRepercutido)}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl">
            Nota: Los arrendamientos destinados exclusivamente a vivienda habitual están legalmente exentos de IVA según el Art. 20.Uno.23 Ley 37/1992.
          </p>
        </div>

        {/* Retenciones IRPF (Modelo 115 / Rendimientos Inmobiliarios) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
              115
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Retenciones IRPF (Modelo 115 / IRPF Arrendador)</h3>
              <p className="text-xs text-slate-500">Retenciones practicadas por los arrendatarios en alquileres comerciales.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Base sujeta a retención (19%):</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(commercialInvoices.reduce((acc, i) => acc + i.baseAmount, 0))}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Gastos fiscalmente deducibles IRPF:</span>
              <span className="font-semibold text-emerald-700">{formatCurrency(totalDeductibleExpenses)}</span>
            </div>
            <div className="flex justify-between py-2 pt-3 font-bold text-sm text-slate-900">
              <span>Total retenciones computables a favor:</span>
              <span className="text-sky-700">{formatCurrency(totalRetentionRetenida)}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl">
            Las retenciones del 19% aplicadas en las facturas de local/oficina computan como pagos a cuenta en la declaración del IRPF o Impuesto sobre Sociedades.
          </p>
        </div>
      </div>
    </div>
  );
};
