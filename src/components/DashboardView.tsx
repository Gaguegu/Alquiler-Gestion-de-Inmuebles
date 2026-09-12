import React from 'react';
import { AppState, Property } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DashboardViewProps {
  state: AppState;
  selectedPropertyId: string;
  setActiveTab: (tab: string) => void;
  onOpenGenerateInvoices: () => void;
  onOpenNewExpense: () => void;
  onOpenNewIssue: () => void;
  onSelectInvoiceForPrint: (invoiceId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  selectedPropertyId,
  setActiveTab,
  onOpenGenerateInvoices,
  onOpenNewExpense,
  onOpenNewIssue,
  onSelectInvoiceForPrint,
}) => {
  const { properties, contracts, invoices, expenses, issues, tenants } = state;

  // Filter based on selected property
  const filteredProperties = selectedPropertyId === 'all'
    ? properties
    : properties.filter(p => p.id === selectedPropertyId);

  const filteredInvoices = selectedPropertyId === 'all'
    ? invoices
    : invoices.filter(i => i.propertyId === selectedPropertyId);

  const filteredExpenses = selectedPropertyId === 'all'
    ? expenses
    : expenses.filter(e => e.propertyId === selectedPropertyId);

  const filteredIssues = selectedPropertyId === 'all'
    ? issues
    : issues.filter(i => i.propertyId === selectedPropertyId);

  const filteredContracts = selectedPropertyId === 'all'
    ? contracts
    : contracts.filter(c => c.propertyId === selectedPropertyId);

  // Calculate Metrics
  const totalProperties = filteredProperties.length;
  const rentedProperties = filteredProperties.filter(p => p.status === 'alquilado').length;
  const occupancyRate = totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0;

  // Monthly income: sum of totalAmount of invoices this current/recent period
  const totalIncome = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = filteredInvoices
    .filter(inv => inv.status === 'cobrado')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'pendiente' || inv.status === 'vencido');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0);

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netYield = totalIncome - totalExpenses;

  const openIssues = filteredIssues.filter(i => i.status === 'abierta' || i.status === 'en_gestion');

  // Month-by-month financial summary (Simulated or aggregated)
  const monthlyData = [
    { month: 'Nov', income: 3650, expenses: 540 },
    { month: 'Dic', income: 3650, expenses: 720 },
    { month: 'Ene', income: 3650, expenses: 420 },
    { month: 'Feb', income: 3698, expenses: 1375 },
    { month: 'Mar', income: 3698, expenses: 225 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0b4f8a] to-[#1565c0] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/20 text-sky-200 border border-sky-300/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Gestión Privada Activa
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {selectedPropertyId === 'all' 
                ? 'Panel de Control Inmobiliario' 
                : filteredProperties[0]?.name || 'Ficha del Inmueble'}
            </h1>
            <p className="text-sky-100 text-sm mt-1 max-w-xl">
              Supervisión de rentas, control de cobros, liquidación fiscal y registro de incidencias patrimoniales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenGenerateInvoices}
              id="dash-quick-generate-invoices-btn"
              className="px-4 py-2.5 bg-white text-[#0b4f8a] hover:bg-sky-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Generar Recibos del Mes</span>
            </button>
            <button
              onClick={onOpenNewExpense}
              id="dash-quick-expense-btn"
              className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center space-x-1.5 border border-white/20"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Registrar Gasto</span>
            </button>
            <button
              onClick={onOpenNewIssue}
              id="dash-quick-issue-btn"
              className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center space-x-1.5 border border-white/20"
            >
              <Wrench className="w-4 h-4" />
              <span>Nueva Incidencia</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingresos Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Facturado Total</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalIncome)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 justify-between">
            <span className="text-emerald-700 font-medium">Cobrado: {formatCurrency(totalCollected)}</span>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-[#0b4f8a] hover:underline font-semibold flex items-center"
            >
              Ver facturas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Gastos Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gastos Acumulados</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 justify-between">
            <span>Deducibles IRPF: 100%</span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-[#0b4f8a] hover:underline font-semibold flex items-center"
            >
              Ver gastos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Rendimiento Neto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rendimiento Neto</span>
            <div className="p-2 bg-sky-50 text-sky-700 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight ${netYield >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatCurrency(netYield)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 justify-between">
            <span>Margen neto: {totalIncome > 0 ? ((netYield / totalIncome) * 100).toFixed(1) : 0}%</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-[#0b4f8a] hover:underline font-semibold flex items-center"
            >
              Informe fiscal <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Ocupación & Inmuebles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasa de Ocupación</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{occupancyRate.toFixed(0)}%</span>
            <span className="text-xs text-slate-500 font-medium">
              ({rentedProperties} de {totalProperties} activos)
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 justify-between">
            <span className="text-amber-600 font-medium">{openIssues.length} incidencias</span>
            <button
              onClick={() => setActiveTab('properties')}
              className="text-[#0b4f8a] hover:underline font-semibold flex items-center"
            >
              Inmuebles <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Row: Financial Trend & Pending Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evolución Mensual (SVG Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Evolución Financiera Reciente</h2>
              <p className="text-xs text-slate-500">Comparativa mensual de ingresos facturados vs gastos operativos</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#0b4f8a]" />
                <span className="text-slate-600">Ingresos</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-400" />
                <span className="text-slate-600">Gastos</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Bar Chart */}
          <div className="space-y-4">
            {monthlyData.map((item, idx) => {
              const maxVal = 4200;
              const incPercent = Math.min((item.income / maxVal) * 100, 100);
              const expPercent = Math.min((item.expenses / maxVal) * 100, 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.month}</span>
                    <span className="text-slate-500">
                      Ingreso: <strong className="text-slate-900">{formatCurrency(item.income)}</strong> | Gasto: <strong className="text-rose-600">{formatCurrency(item.expenses)}</strong>
                    </span>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5 space-x-1">
                    <div
                      style={{ width: `${incPercent}%` }}
                      className="h-full bg-[#0b4f8a] rounded-sm transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-medium"
                    />
                    <div
                      style={{ width: `${expPercent}%` }}
                      className="h-full bg-rose-400 rounded-sm transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rendimiento neto medio estimado: <strong>81.4%</strong></span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-[#0b4f8a] hover:underline font-semibold"
            >
              Ver desglose tributario y fiscal completo →
            </button>
          </div>
        </div>

        {/* Right Col: Estado de Cobros y Alertas */}
        <div className="space-y-6">
          {/* Cobros pendientes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
                Cobros Pendientes
              </h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {pendingInvoices.length} recibos
              </span>
            </div>

            {pendingInvoices.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs font-medium text-slate-600">Al día. No hay cobros vencidos ni pendientes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInvoices.map((inv) => {
                  const prop = properties.find(p => p.id === inv.propertyId);
                  const ten = tenants.find(t => t.id === inv.tenantId);
                  return (
                    <div
                      key={inv.id}
                      className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{inv.number}</p>
                        <p className="text-[11px] text-slate-600 truncate max-w-[150px]">{ten?.name || prop?.name}</p>
                        <p className="text-[10px] text-amber-800 font-medium">Vence: {formatDate(inv.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</p>
                        <button
                          onClick={() => onSelectInvoiceForPrint(inv.id)}
                          className="text-[11px] text-[#0b4f8a] hover:underline font-semibold block mt-1"
                        >
                          Ver Recibo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setActiveTab('invoices')}
              className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Ir a Facturación y Cobros
            </button>
          </div>

          {/* Incidencias activas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Wrench className="w-4 h-4 mr-1.5 text-sky-600" />
                Incidencias en Curso
              </h3>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                {openIssues.length} activas
              </span>
            </div>

            {openIssues.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No hay reparaciones pendientes.</p>
            ) : (
              <div className="space-y-2.5">
                {openIssues.map((iss) => {
                  const prop = properties.find(p => p.id === iss.propertyId);
                  return (
                    <div
                      key={iss.id}
                      onClick={() => setActiveTab('issues')}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">{iss.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm uppercase ${
                          iss.priority === 'urgente' || iss.priority === 'alta'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {iss.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{prop?.name}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
