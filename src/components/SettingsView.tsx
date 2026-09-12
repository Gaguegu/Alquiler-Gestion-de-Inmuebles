import React, { useState } from 'react';
import { LandlordSettings, AppState } from '../types';
import { exportStateAsJson } from '../utils/storage';
import {
  Settings,
  Building,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Hash,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface SettingsViewProps {
  settings: LandlordSettings;
  onSaveSettings: (settings: LandlordSettings) => void;
  fullState: AppState;
  onRestoreState: (state: AppState) => void;
  onResetToDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  fullState,
  onRestoreState,
  onResetToDemo,
}) => {
  const [formData, setFormData] = useState<LandlordSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.properties || !parsed.tenants || !parsed.settings) {
          throw new Error('El archivo no tiene la estructura de copia de seguridad válida de ANSAMA.');
        }
        onRestoreState(parsed);
        alert('¡Copia de seguridad restaurada con éxito!');
        setRestoreError(null);
      } catch (err: any) {
        setRestoreError(err.message || 'Error al procesar el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h1>
          <p className="text-sm text-slate-500">Parámetros del arrendador fiscal, series de facturación y copias de seguridad de datos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Formulario de Configuración Fiscal */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0b4f8a] flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Datos Fiscales del Arrendador / Titular</h2>
              <p className="text-xs text-slate-500">Esta información aparecerá en los recibos y facturas generados automáticamente.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Datos fiscales guardados correctamente.</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre Completo o Razón Social *</label>
              <input
                type="text"
                required
                value={formData.landlordName}
                onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIF / CIF del Titular *</label>
                <input
                  type="text"
                  required
                  value={formData.landlordNif}
                  onChange={(e) => setFormData({ ...formData, landlordNif: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={formData.landlordPhone}
                  onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Domicilio Fiscal</label>
              <input
                type="text"
                value={formData.landlordAddress}
                onChange={(e) => setFormData({ ...formData, landlordAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={formData.landlordCity}
                  onChange={(e) => setFormData({ ...formData, landlordCity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código Postal</label>
                <input
                  type="text"
                  value={formData.landlordPostalCode}
                  onChange={(e) => setFormData({ ...formData, landlordPostalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico para Facturas</label>
              <input
                type="email"
                value={formData.landlordEmail}
                onChange={(e) => setFormData({ ...formData, landlordEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cuenta Bancaria Principal (IBAN para cobros)</label>
              <input
                type="text"
                value={formData.landlordIban}
                onChange={(e) => setFormData({ ...formData, landlordIban: e.target.value })}
                placeholder="ESXX 0000 0000 0000 0000 0000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs font-bold"
              />
            </div>

            {/* Invoicing Series */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-xs mb-3 flex items-center">
                <Hash className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                Configuración de Series y Facturación
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prefijo Facturas</label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prefijo Recibos</label>
                  <input
                    type="text"
                    value={formData.receiptPrefix}
                    onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">IVA Local (%)</label>
                  <input
                    type="number"
                    value={formData.defaultVat}
                    onChange={(e) => setFormData({ ...formData, defaultVat: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ret. IRPF (%)</label>
                  <input
                    type="number"
                    value={formData.defaultRetention}
                    onChange={(e) => setFormData({ ...formData, defaultRetention: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                id="save-settings-btn"
                className="px-5 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Backup & Respaldo */}
        <div className="space-y-6">
          {/* Backup Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Copias de Seguridad (Backup)</h3>
                <p className="text-xs text-slate-500">Tus datos seguros en tu propio ordenador sin riesgo de pérdida.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Exporta un archivo JSON con todos los inmuebles, contratos, inquilinos, cobros, gastos y recibos. Podrás restaurarlo en cualquier momento o equipo.
            </p>

            <button
              onClick={() => exportStateAsJson(fullState)}
              id="export-backup-btn"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Copia de Seguridad JSON</span>
            </button>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Restaurar Copia de Seguridad</label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center cursor-pointer transition-colors border border-slate-200">
                  <Upload className="w-4 h-4 inline mr-1 text-slate-500" />
                  Seleccionar archivo .JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
              {restoreError && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{restoreError}</p>
              )}
            </div>
          </div>

          {/* Reset / Demo Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
              <RotateCcw className="w-4 h-4 mr-1.5 text-slate-400" />
              Datos de Muestra y Reinicio
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Puedes recargar los datos de prueba iniciales de ANSAMA o restablecer la base de datos para comenzar desde cero.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  if (confirm('¿Restaurar los datos de demostración iniciales de ANSAMA?')) {
                    onResetToDemo();
                  }
                }}
                id="reset-demo-btn"
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cargar Datos de Demostración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
