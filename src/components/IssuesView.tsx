import React, { useState } from 'react';
import { Issue, Property, IssuePriority, IssueStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  Edit2,
  UserCheck
} from 'lucide-react';

interface IssuesViewProps {
  issues: Issue[];
  properties: Property[];
  onSaveIssue: (issue: Issue) => void;
  onDeleteIssue: (id: string) => void;
}

export const IssuesView: React.FC<IssuesViewProps> = ({
  issues,
  properties,
  onSaveIssue,
  onDeleteIssue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const [formData, setFormData] = useState<Partial<Issue>>({
    propertyId: '',
    title: '',
    description: '',
    priority: 'media',
    status: 'abierta',
    reportedDate: new Date().toISOString().split('T')[0],
    estimatedCost: 100,
    actualCost: 0,
    assignedTo: '',
    notes: '',
  });

  const filteredIssues = issues.filter(iss => {
    const prop = properties.find(p => p.id === iss.propertyId);
    const matchesSearch = `${iss.title} ${iss.description} ${prop?.name} ${iss.assignedTo}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || iss.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openNewModal = () => {
    setEditingIssue(null);
    setFormData({
      id: 'iss-' + Date.now(),
      propertyId: properties[0]?.id || '',
      title: '',
      description: '',
      priority: 'media',
      status: 'abierta',
      reportedDate: new Date().toISOString().split('T')[0],
      estimatedCost: 0,
      actualCost: 0,
      assignedTo: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (iss: Issue) => {
    setEditingIssue(iss);
    setFormData({ ...iss });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.title) return;

    const saved: Issue = {
      id: editingIssue ? editingIssue.id : (formData.id || 'iss-' + Date.now()),
      propertyId: formData.propertyId,
      title: formData.title,
      description: formData.description || '',
      priority: (formData.priority as IssuePriority) || 'media',
      status: (formData.status as IssueStatus) || 'abierta',
      reportedDate: formData.reportedDate || new Date().toISOString().split('T')[0],
      resolvedDate: formData.status === 'resuelta' ? (formData.resolvedDate || new Date().toISOString().split('T')[0]) : undefined,
      estimatedCost: Number(formData.estimatedCost) || 0,
      actualCost: Number(formData.actualCost) || 0,
      assignedTo: formData.assignedTo,
      notes: formData.notes,
    };

    onSaveIssue(saved);
    setModalOpen(false);
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case 'urgente':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">Alta</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">Media</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">Baja</span>;
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'resuelta':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Resuelta
          </span>
        );
      case 'en_gestion':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800">
            <Clock className="w-3 h-3 mr-1" /> En gestión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Abierta
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incidencias y Reparaciones</h1>
          <p className="text-sm text-slate-500">Gestión de averías, partes a aseguradoras, control de técnicos y costes de reparación.</p>
        </div>
        <button
          onClick={openNewModal}
          id="add-issue-btn"
          className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Incidencia</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 ml-2 mr-2 shrink-0" />
          <input
            type="text"
            id="search-issues-input"
            placeholder="Buscar por título, técnico o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-slate-800 focus:outline-hidden bg-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs w-full md:w-auto justify-end">
          <span className="text-slate-500 font-medium">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
          >
            <option value="all">Todos los estados</option>
            <option value="abierta">Abierta</option>
            <option value="en_gestion">En gestión</option>
            <option value="resuelta">Resuelta</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue) => {
          const prop = properties.find(p => p.id === issue.propertyId);

          return (
            <div
              key={issue.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-xs text-[#0b4f8a] font-semibold">{prop?.name}</span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{issue.title}</h3>
                  </div>
                  <div>{getPriorityBadge(issue.priority)}</div>
                </div>

                <div className="py-3 space-y-2.5 text-xs text-slate-600">
                  <p className="line-clamp-2 text-slate-700 leading-relaxed">{issue.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Notificada: {formatDate(issue.reportedDate)}</span>
                    <div>{getStatusBadge(issue.status)}</div>
                  </div>

                  {issue.assignedTo && (
                    <div className="flex items-center text-slate-700 bg-slate-50 p-2 rounded-lg text-[11px]">
                      <UserCheck className="w-3.5 h-3.5 mr-1.5 text-sky-600 shrink-0" />
                      <span>Técnico: <strong>{issue.assignedTo}</strong></span>
                    </div>
                  )}

                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Estimado: {formatCurrency(issue.estimatedCost)}</span>
                    <span className="font-bold text-slate-800">
                      Coste real: {formatCurrency(issue.actualCost || issue.estimatedCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(issue)}
                  className="text-xs font-semibold text-[#0b4f8a] hover:underline flex items-center"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Editar / Actualizar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar la incidencia "${issue.title}"?`)) {
                      onDeleteIssue(issue.id);
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

      {/* Modal Incidencia */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">
                {editingIssue ? 'Gestionar Incidencia' : 'Nueva Incidencia / Avería'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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
                <label className="block font-semibold text-slate-700 mb-1">Título de la Incidencia *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Avería en caldera de gas"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción del Problema</label>
                <textarea
                  rows={2}
                  placeholder="Detalles reportados por el inquilino..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as IssuePriority })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as IssueStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="abierta">Abierta (Sin atender)</option>
                    <option value="en_gestion">En gestión / Técnico avisado</option>
                    <option value="resuelta">Resuelta</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Técnico o Empresa Asignada</label>
                  <input
                    type="text"
                    placeholder="ej. SAT Saunier Duval"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coste Real Reparación (€)</label>
                  <input
                    type="number"
                    value={formData.actualCost}
                    onChange={(e) => setFormData({ ...formData, actualCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
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
                  Guardar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
