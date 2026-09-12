import React, { useState } from 'react';
import { Property, Tenant, Contract, PropertyType, PropertyStatus } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  Building2,
  Home,
  Store,
  Warehouse,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Layers,
  Key
} from 'lucide-react';

interface PropertiesViewProps {
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  onSaveProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onSelectPropertyFilter: (id: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  tenants,
  contracts,
  onSaveProperty,
  onDeleteProperty,
  onSelectPropertyFilter,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form fields
  const [formData, setFormData] = useState<Partial<Property>>({
    name: '',
    address: '',
    postalCode: '',
    city: 'Madrid',
    province: 'Madrid',
    cadastralRef: '',
    type: 'vivienda',
    surfaceM2: 80,
    rooms: 2,
    bathrooms: 1,
    status: 'disponible',
    currentRent: 1000,
    notes: '',
  });

  const openNewModal = () => {
    setEditingProperty(null);
    setFormData({
      id: 'prop-' + Date.now(),
      name: '',
      address: '',
      postalCode: '',
      city: 'Madrid',
      province: 'Madrid',
      cadastralRef: '',
      type: 'vivienda',
      surfaceM2: 75,
      rooms: 2,
      bathrooms: 1,
      status: 'disponible',
      currentRent: 950,
      notes: '',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Property) => {
    setEditingProperty(p);
    setFormData({ ...p });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    const saved: Property = {
      id: editingProperty ? editingProperty.id : (formData.id || 'prop-' + Date.now()),
      name: formData.name || 'Inmueble',
      address: formData.address || '',
      postalCode: formData.postalCode || '',
      city: formData.city || '',
      province: formData.province || '',
      cadastralRef: formData.cadastralRef || '',
      type: (formData.type as PropertyType) || 'vivienda',
      surfaceM2: Number(formData.surfaceM2) || 0,
      rooms: Number(formData.rooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      status: (formData.status as PropertyStatus) || 'disponible',
      currentRent: Number(formData.currentRent) || 0,
      notes: formData.notes || '',
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveProperty(saved);
    setModalOpen(false);
  };

  const getTypeIcon = (type: PropertyType) => {
    switch (type) {
      case 'vivienda': return Home;
      case 'local': return Store;
      case 'oficina': return Briefcase;
      case 'garaje': return Warehouse;
      default: return Building2;
    }
  };

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'alquilado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Alquilado
          </span>
        );
      case 'en_reforma':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 mr-1" /> En reforma
          </span>
        );
      case 'reservado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
            <Key className="w-3.5 h-3.5 mr-1" /> Reservado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Disponible
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Inmuebles</h1>
          <p className="text-sm text-slate-500">Gestión de cartera, superficies, rentas de mercado y estado de ocupación.</p>
        </div>
        <button
          onClick={openNewModal}
          id="add-property-btn"
          className="px-4 py-2.5 bg-[#0b4f8a] hover:bg-[#093d6b] text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Inmueble</span>
        </button>
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => {
          const Icon = getTypeIcon(property.type);
          const activeContract = contracts.find(
            c => c.propertyId === property.id && c.status === 'activo'
          );
          const currentTenant = activeContract
            ? tenants.find(t => t.id === activeContract.tenantId)
            : null;

          return (
            <div
              key={property.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Top / Header */}
                <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0b4f8a] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{property.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{property.type} · {property.surfaceM2} m²</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(property.status)}</div>
                </div>

                {/* Card Details */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-start text-slate-600">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{property.address}, {property.postalCode} {property.city}</span>
                  </div>

                  {property.cadastralRef && (
                    <div className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg font-mono">
                      Ref: {property.cadastralRef}
                    </div>
                  )}

                  {/* Financial & Contract Summary */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium uppercase">Renta Actual</p>
                      <p className="text-base font-bold text-slate-900">
                        {property.currentRent > 0 ? `${formatCurrency(property.currentRent)}/mes` : 'Sin alquilar'}
                      </p>
                    </div>

                    {currentTenant ? (
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400 font-medium uppercase">Inquilino</p>
                        <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                          {currentTenant.name}
                        </p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400 font-medium uppercase">Disponibilidad</p>
                        <p className="text-xs font-semibold text-slate-500">Inmediata</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectPropertyFilter(property.id)}
                  className="text-xs font-semibold text-[#0b4f8a] hover:underline"
                >
                  Filtrar en todo el panel →
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(property)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                    title="Editar datos del inmueble"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el inmueble "${property.name}"?`)) {
                        onDeleteProperty(property.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar inmueble"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Alta / Edición de Inmueble */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-slate-100">
                {editingProperty ? 'Editar Inmueble' : 'Añadir Nuevo Inmueble'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre / Alias del Inmueble *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Piso Mayor 42, 3ºB"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Inmueble</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                  >
                    <option value="vivienda">Vivienda</option>
                    <option value="local">Local Comercial</option>
                    <option value="oficina">Oficina</option>
                    <option value="garaje">Plaza de Garaje</option>
                    <option value="trastero">Trastero</option>
                    <option value="nave">Nave Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de Ocupación</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PropertyStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                  >
                    <option value="alquilado">Alquilado</option>
                    <option value="disponible">Disponible</option>
                    <option value="en_reforma">En reforma</option>
                    <option value="reservado">Reservado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección Completa *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Calle Mayor 42, 3º B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provincia</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    value={formData.surfaceM2}
                    onChange={(e) => setFormData({ ...formData, surfaceM2: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Habitaciones</label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Baños</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referencia Catastral</label>
                  <input
                    type="text"
                    placeholder="20 caracteres alfanuméricos"
                    value={formData.cadastralRef}
                    onChange={(e) => setFormData({ ...formData, cadastralRef: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Renta Mensual Estimada (€)</label>
                  <input
                    type="number"
                    value={formData.currentRent}
                    onChange={(e) => setFormData({ ...formData, currentRent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de reformas, suministros, inventario..."
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
                  {editingProperty ? 'Guardar Cambios' : 'Crear Inmueble'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
