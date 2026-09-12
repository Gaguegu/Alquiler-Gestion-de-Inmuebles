import React, { useState } from 'react';
import { PropertyDocument, Property, DocumentCategory } from '../types';
import { formatDate } from '../utils/storage';
import {
  FolderLock,
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  X,
  UploadCloud,
  FileCheck,
  Shield,
  Zap,
  Building
} from 'lucide-react';

interface DocumentsViewProps {
  documents: PropertyDocument[];
  properties: Property[];
  onSaveDocument: (doc: PropertyDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  properties,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<PropertyDocument>>({
    propertyId: '',
    title: '',
    category: 'contrato',
    date: new Date().toISOString().split('T')[0],
    fileName: '',
    fileSize: '',
    notes: '',
  });

  const filteredDocs = documents.filter(doc => {
    const prop = properties.find(p => p.id === doc.propertyId);
    const text = `${doc.title} ${doc.fileName} ${prop?.name} ${doc.notes}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openNewModal = () => {
    setFormData({
      id: 'doc-' + Date.now(),
      propertyId: properties[0]?.id || '',
      title: '',
      category: 'contrato',
      date: new Date().toISOString().split('T')[0],
      fileName: 'Documento_Legal.pdf',
      fileSize: '1.2 MB',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.title) return;

    const saved: PropertyDocument = {
      id: formData.id || 'doc-' + Date.now(),
      propertyId: formData.propertyId,
      title: formData.title,
      category: (formData.category as DocumentCategory) || 'otros',
      date: formData.date || new Date().toISOString().split('T')[0],
      fileName: formData.fileName || 'documento.pdf',
      fileSize: formData.fileSize || '1.0 MB',
      notes: formData.notes,
    };

    onSaveDocument(saved);
    setModalOpen(false);
  };

  const getCategoryIcon = (cat: DocumentCategory) => {
    switch (cat) {
      case 'contrato': return FileCheck;
      case 'escritura': return Building;
      case 'seguro': return Shield;
      case 'certificado_energetico': return Zap;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Archivo Documental</h1>
          <p className="text-sm text-slate-500">Custodia de contratos, escrituras de propiedad, pólizas, certificados energéticos y recibos de IBI.</p>
        </div>
        <button
          onClick={openNewModal}
          id="add-document-btn"
          className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Documento</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 ml-2 mr-2 shrink-0" />
          <input
            type="text"
            id="search-docs-input"
            placeholder="Buscar por título o archivo..."
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
            <option value="contrato">Contratos</option>
            <option value="escritura">Escrituras Notariales</option>
            <option value="seguro">Seguros</option>
            <option value="certificado_energetico">Certificado Energético</option>
            <option value="ibi">Tributos / IBI</option>
            <option value="cedula">Cédula Habitabilidad</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => {
          const prop = properties.find(p => p.id === doc.propertyId);
          const Icon = getCategoryIcon(doc.category);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0b4f8a] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] font-bold text-[#0b4f8a] uppercase tracking-wider">
                      {doc.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{prop?.name}</p>
                  </div>
                </div>

                <div className="py-3 space-y-2 text-xs text-slate-600">
                  {doc.notes && <p className="text-slate-600 text-[11px]">{doc.notes}</p>}

                  <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-mono truncate mr-2">{doc.fileName || 'archivo.pdf'}</span>
                    <span className="text-slate-400 shrink-0 font-medium">{doc.fileSize || '1 MB'}</span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Registrado el: {formatDate(doc.date)}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => alert(`Visualización de "${doc.fileName}" lista. Archivo almacenado de forma segura en el repositorio del inmueble.`)}
                  className="text-xs font-semibold text-[#0b4f8a] hover:underline flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Descargar / Abrir
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar documento "${doc.title}"?`)) {
                      onDeleteDocument(doc.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Alta Documento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">Registrar Documento</h3>
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
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as DocumentCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="contrato">Contrato de Arrendamiento</option>
                    <option value="escritura">Escritura Notarial</option>
                    <option value="seguro">Póliza de Seguro</option>
                    <option value="certificado_energetico">Certificado Energético (CEE)</option>
                    <option value="ibi">Recibo IBI</option>
                    <option value="cedula">Cédula de Habitabilidad</option>
                    <option value="otros">Otros Documentos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título del Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Escritura de Compraventa y Estatutos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* File upload box */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Archivo Adjunto (PDF, JPG, PNG)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs text-slate-600 font-medium">
                    {formData.fileName ? formData.fileName : 'Selecciona o arrastra el archivo aquí'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Hasta 25 MB por documento</p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-[#0b4f8a] hover:file:bg-sky-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas / Referencias Registrales</label>
                <textarea
                  rows={2}
                  placeholder="Anotaciones notariales, fechas de renovación..."
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
                  Guardar en Archivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
