import React, { useState } from 'react';
import { Property } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  TrendingUp,
  Calculator,
  Building,
  PiggyBank,
  Percent,
  Wallet,
  Coins,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BarChart3
} from 'lucide-react';

interface InvestmentSimulatorViewProps {
  properties: Property[];
  onSelectPropertyFilter?: (propertyId: string) => void;
}

export const InvestmentSimulatorView: React.FC<InvestmentSimulatorViewProps> = ({
  properties,
}) => {
  // Preset simulation or loaded property
  const [selectedPropId, setSelectedPropId] = useState<string>('custom');

  // Input states
  const [purchasePrice, setPurchasePrice] = useState<number>(180000);
  const [itpPercent, setItpPercent] = useState<number>(6.0); // 6% Madrid, 10% BCN/Val
  const [notaryRegistryCosts, setNotaryRegistryCosts] = useState<number>(3000);
  const [renovationCost, setRenovationCost] = useState<number>(15000);

  // Mortgage
  const [useMortgage, setUseMortgage] = useState<boolean>(true);
  const [mortgagePercent, setMortgagePercent] = useState<number>(70); // 70% LTV
  const [mortgageInterestRate, setMortgageInterestRate] = useState<number>(2.9); // 2.9%
  const [mortgageYears, setMortgageYears] = useState<number>(25);

  // Income & Expenses
  const [monthlyRent, setMonthlyRent] = useState<number>(950);
  const [occupancyMonths, setOccupancyMonths] = useState<number>(11.5); // 11.5 months
  const [communityMonthly, setCommunityMonthly] = useState<number>(50);
  const [ibiAnnual, setIbiAnnual] = useState<number>(350);
  const [insuranceAnnual, setInsuranceAnnual] = useState<number>(220);
  const [maintenanceAnnualPercent, setMaintenanceAnnualPercent] = useState<number>(1.0); // 1% of purchase

  // Load from property
  const handleLoadProperty = (propId: string) => {
    setSelectedPropId(propId);
    if (propId === 'custom') {
      setPurchasePrice(180000);
      setMonthlyRent(950);
      return;
    }
    const prop = properties.find((p) => p.id === propId);
    if (!prop) return;

    // Approximate values from current rent
    const estimatedPrice = prop.currentRent > 0 ? prop.currentRent * 12 * 18 : 160000;
    setPurchasePrice(Math.round(estimatedPrice));
    setMonthlyRent(prop.currentRent || 900);
  };

  // Calculations
  const purchaseTaxes = purchasePrice * (itpPercent / 100);
  const totalAcquisitionCosts = purchaseTaxes + notaryRegistryCosts;
  const totalProjectCost = purchasePrice + totalAcquisitionCosts + renovationCost;

  // Mortgage calculations
  const loanAmount = useMortgage ? (purchasePrice * (mortgagePercent / 100)) : 0;
  const personalEquity = totalProjectCost - loanAmount; // Cash out of pocket

  // Monthly mortgage installment (French amortization formula)
  let monthlyMortgagePayment = 0;
  if (useMortgage && loanAmount > 0 && mortgageInterestRate > 0 && mortgageYears > 0) {
    const monthlyRate = (mortgageInterestRate / 100) / 12;
    const totalMonths = mortgageYears * 12;
    monthlyMortgagePayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }
  const annualMortgagePayment = monthlyMortgagePayment * 12;

  // Annual gross income adjusted by occupancy
  const annualGrossIncome = (monthlyRent * occupancyMonths);

  // Annual operational expenses
  const annualCommunity = communityMonthly * 12;
  const annualMaintenance = (purchasePrice * (maintenanceAnnualPercent / 100));
  const totalAnnualOperatingExpenses = annualCommunity + ibiAnnual + insuranceAnnual + annualMaintenance;

  // Net operating income (NOI) before mortgage
  const annualNetIncome = Math.max(0, annualGrossIncome - totalAnnualOperatingExpenses);

  // Cash flow after mortgage
  const annualCashFlow = annualNetIncome - annualMortgagePayment;
  const monthlyCashFlow = annualCashFlow / 12;

  // Key performance indicators (KPIs)
  const grossYield = totalProjectCost > 0 ? ((monthlyRent * 12) / totalProjectCost) * 100 : 0;
  const netYield = totalProjectCost > 0 ? (annualNetIncome / totalProjectCost) * 100 : 0;
  const cashOnCashReturn = personalEquity > 0 ? (annualCashFlow / personalEquity) * 100 : 0;
  const paybackYears = annualCashFlow > 0 ? (personalEquity / annualCashFlow) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-[#0b4f8a]" />
            <span>Simulador de Rentabilidad & Inversión Inmobiliaria</span>
          </h1>
          <p className="text-sm text-slate-500">
            Analiza el rendimiento real (Yield Bruto, Neto, Cash Flow y RoCE) de tus inmuebles o nuevas oportunidades de compra.
          </p>
        </div>

        {/* Load Property Select */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600">Analizar:</span>
          <select
            value={selectedPropId}
            onChange={(e) => handleLoadProperty(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#0b4f8a] focus:outline-hidden"
          >
            <option value="custom">✨ Nueva Oportunidad / Simulación</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                🏢 {p.name} ({formatCurrency(p.currentRent)}/mes)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPIs Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rentabilidad Bruta
            </span>
            <div className="p-1.5 bg-sky-50 text-[#0b4f8a] rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{grossYield.toFixed(2)}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Renta anual / Inversión total
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rentabilidad Neta
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">{netYield.toFixed(2)}%</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Deduciendo gastos operativos reales
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cash Flow Neto
            </span>
            <div className={`p-1.5 rounded-lg ${monthlyCashFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-3xl font-black mt-2 ${monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(monthlyCashFlow)}
            <span className="text-xs font-semibold text-slate-500">/mes</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatCurrency(annualCashFlow)} limpio al año
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Retorno Capital (RoCE)
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">
            {useMortgage ? `${cashOnCashReturn.toFixed(2)}%` : `${netYield.toFixed(2)}%`}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Payback en {paybackYears > 0 ? `${paybackYears.toFixed(1)} años` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Simulator Inputs & Analysis Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Input Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Compra y Gastos Iniciales */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Building className="w-4.5 h-4.5 text-[#0b4f8a]" />
              <span>1. Adquisición e Inversión Inicial</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Precio de Compra (€)</label>
                <input
                  type="number"
                  step="1000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Impuesto de Transmisiones (ITP / IVA %)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    value={itpPercent}
                    onChange={(e) => setItpPercent(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
                  />
                  <div className="flex space-x-1">
                    {[6, 8, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setItpPercent(val)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${
                          itpPercent === val ? 'bg-[#0b4f8a] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notaría, Registro y Gestoría (€)</label>
                <input
                  type="number"
                  step="250"
                  value={notaryRegistryCosts}
                  onChange={(e) => setNotaryRegistryCosts(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reforma / Mobiliario (€)</label>
                <input
                  type="number"
                  step="500"
                  value={renovationCost}
                  onChange={(e) => setRenovationCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Coste total del proyecto (Desembolso):</span>
              <strong className="text-slate-900 text-sm font-bold">{formatCurrency(totalProjectCost)}</strong>
            </div>
          </div>

          {/* 2. Financiación Hipotecaria */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <PiggyBank className="w-4.5 h-4.5 text-emerald-600" />
                <span>2. Financiación Hipotecaria (Apalancamiento)</span>
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={useMortgage}
                  onChange={(e) => setUseMortgage(e.target.checked)}
                  className="rounded-sm text-[#0b4f8a]"
                />
                <span>Financiar con Hipoteca</span>
              </label>
            </div>

            {useMortgage ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">% Financiado (LTV)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="5"
                      value={mortgagePercent}
                      onChange={(e) => setMortgagePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                    <span className="font-bold text-slate-500">%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Préstamo: {formatCurrency(loanAmount)}</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Interés Anual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mortgageInterestRate}
                    onChange={(e) => setMortgageInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Tipo Fijo o Mixto</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plazo de Amortización (Años)</label>
                  <input
                    type="number"
                    step="5"
                    value={mortgageYears}
                    onChange={(e) => setMortgageYears(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cuota: <strong>{formatCurrency(monthlyMortgagePayment)}/mes</strong>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                Compra al contado (100% fondos propios). Sin apalancamiento bancario ni cuotas mensuales.
              </p>
            )}
          </div>

          {/* 3. Ingresos y Gastos de Operación */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
              <span>3. Ingresos por Renta y Gastos Recurrentes</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Renta Mensual Alquiler (€)</label>
                <input
                  type="number"
                  step="25"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-slate-900 text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meses Ocupados / Año</label>
                <input
                  type="number"
                  step="0.5"
                  max="12"
                  min="8"
                  value={occupancyMonths}
                  onChange={(e) => setOccupancyMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Ajuste por desocupación</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Comunidad (€/mes)</label>
                <input
                  type="number"
                  value={communityMonthly}
                  onChange={(e) => setCommunityMonthly(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IBI Anual (€/año)</label>
                <input
                  type="number"
                  value={ibiAnnual}
                  onChange={(e) => setIbiAnnual(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seguro Hogar / Impago (€/año)</label>
                <input
                  type="number"
                  value={insuranceAnnual}
                  onChange={(e) => setInsuranceAnnual(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mantenimiento (% anual)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maintenanceAnnualPercent}
                  onChange={(e) => setMaintenanceAnnualPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Executive Summary Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-6 rounded-2xl shadow-xl space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                Resumen Ejecutivo
              </span>
              <h3 className="text-xl font-bold mt-1">Estructura del Negocio</h3>
            </div>

            {/* Visual Bar Comparison */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Fondos Propios Aportados:</span>
                <span className="font-bold text-white">{formatCurrency(personalEquity)}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className="bg-sky-400 h-2.5"
                  style={{ width: `${Math.min(100, (personalEquity / totalProjectCost) * 100)}%` }}
                />
                <div
                  className="bg-emerald-400 h-2.5"
                  style={{ width: `${Math.min(100, (loanAmount / totalProjectCost) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Capital propio ({((personalEquity / totalProjectCost) * 100).toFixed(0)}%)</span>
                <span>Hipoteca ({((loanAmount / totalProjectCost) * 100).toFixed(0)}%)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Ingreso Bruto Anual:</span>
                <span className="font-semibold">{formatCurrency(annualGrossIncome)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>Gastos Operativos Anuales:</span>
                <span>-{formatCurrency(totalAnnualOperatingExpenses)}</span>
              </div>
              {useMortgage && (
                <div className="flex justify-between text-amber-300">
                  <span>Amortización Hipoteca Anual:</span>
                  <span>-{formatCurrency(annualMortgagePayment)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-sm text-emerald-400">
                <span>Cash Flow Anual Limpio:</span>
                <span>{formatCurrency(annualCashFlow)}</span>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-xl border border-white/10 space-y-2 text-xs">
              <p className="font-bold text-sky-300 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Dictamen de Inversión</span>
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {netYield >= 5
                  ? `Excelente rentabilidad neta del ${netYield.toFixed(2)}%, por encima de la media del mercado residencial español (4.5% - 5.2%).`
                  : `Rentabilidad neta del ${netYield.toFixed(2)}%. Recomendado optimizar precio de compra o ajustar reforma para maximizar retorno.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
