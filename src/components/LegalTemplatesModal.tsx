import React, { useState, useEffect } from 'react';
import { Property, Tenant, Contract, LandlordSettings } from '../types';
import { legalTemplates, LegalTemplate } from '../utils/legalTemplates';
import {
  FileText,
  X,
  Printer,
  Copy,
  Check,
  Download,
  Building,
  User,
  FileSpreadsheet,
  FileCheck,
  Scale
} from 'lucide-react';

interface LegalTemplatesModalProps {
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  settings: LandlordSettings;
  onClose: () => void;
}

export const LegalTemplatesModal: React.FC<LegalTemplatesModalProps> = ({
  properties,
  tenants,
  contracts,
  settings,
  onClose,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    legalTemplates[0]?.id || 'contrato-vivienda'
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || ''
  );
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    tenants[0]?.id || ''
  );

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];
  const selectedTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];
  const relatedContract = contracts.find(
    (c) => c.propertyId === selectedPropertyId && c.tenantId === selectedTenantId
  ) || contracts.find((c) => c.propertyId === selectedPropertyId) || contracts[0];

  const currentTemplate = legalTemplates.find((t) => t.id === selectedTemplateId) || legalTemplates[0];

  const [documentContent, setDocumentContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Re-generate text whenever selections change
  useEffect(() => {
    if (currentTemplate) {
      const generated = currentTemplate.generate({
        settings,
        property: selectedProperty,
        tenant: selectedTenant,
        contract: relatedContract,
      });
      setDocumentContent(generated);
    }
  }, [selectedTemplateId, selectedPropertyId, selectedTenantId, settings]);

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([documentContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentTemplate.id}_${selectedProperty?.name.replace(/\s+/g, '_') || 'documento'}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Repositorio de Modelos y Plantillas Legales LAU
              </h3>
              <p className="text-xs text-slate-400">
                Modelos de contratos, notificaciones y acuerdos pre-cumplimentados con datos reales de tu cartera
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/50">
          {/* Left Sidebar: Template list & entity selectors */}
          <div className="w-full md:w-80 border-r border-slate-200 p-5 space-y-5 bg-white overflow-y-auto no-print">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Selecciona la Plantilla
              </label>
              <div className="space-y-1.5">
                {legalTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-sky-50 border-sky-300 text-[#0b4f8a] shadow-2xs'
                        : 'border-transparent text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-xs">{tmpl.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{tmpl.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Entity Selectors */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Vincular Datos
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" /> Inmueble
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" /> Inquilino
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.dniNie})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Area: Document Preview & Editor */}
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-3 border-b border-slate-200 gap-3 no-print">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>{currentTemplate.title}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Puedes editar directamente el texto abajo antes de imprimir o descargar
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>

            {/* Document Textarea */}
            <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="w-full h-full min-h-[400px] font-mono text-xs leading-relaxed text-slate-800 resize-none focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between no-print">
          <p className="text-[11px] text-slate-500">
            Modelos redactados conforme a la Ley de Arrendamientos Urbanos y Código Civil español.
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
