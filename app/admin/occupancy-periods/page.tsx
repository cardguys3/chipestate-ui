// File: app/admin/occupancy-periods/page.tsx

'use client'

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export default function OccupancyPeriodsAdminPage() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [periods, setPeriods] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    property_id: '',
    tenant_name: '',
    occupancy_start: '',
    occupancy_end: '',
    lease_type: '',
    monthly_rent: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    property: '',
    manager: '',
    start: '',
    end: ''
  });

  const fetchData = async () => {
    const { data: propertyData } = await supabase.from('properties').select('id, title, property_manager_id');
    const { data: managerData } = await supabase.from('property_managers').select('id, name');
    const { data: occupancyData } = await supabase.from('property_occupancy_periods').select('*').order('occupancy_start', { ascending: false });
    setProperties(propertyData || []);
    setManagers(managerData || []);
    setPeriods(occupancyData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from('property_occupancy_periods').insert({
      ...form,
      id: uuidv4(),
      monthly_rent: parseFloat(form.monthly_rent)
    });
    if (!error) {
      setForm({
        property_id: '',
        tenant_name: '',
        occupancy_start: '',
        occupancy_end: '',
        lease_type: '',
        monthly_rent: '',
        notes: ''
      });
      fetchData();
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleUpdate = async (id: string, updated: any) => {
    const { error } = await supabase.from('property_occupancy_periods').update(updated).eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchData();
    }
  };
  
// 🟩 Added Delete Handler
const handleDelete = async (id: string) => {
  const confirmed = confirm("Are you sure you want to delete this occupancy period?");
  if (!confirmed) return;

  const { error } = await supabase.from('property_occupancy_periods').delete().eq('id', id);
  if (!error) {
    fetchData();
  } else {
    console.error('Delete error:', error);
  }
};

  const filtered = periods.filter(p => {
    const prop = properties.find(pr => pr.id === p.property_id);
    const matchesProperty = !filters.property || p.property_id === filters.property;
    const matchesManager = !filters.manager || prop?.property_manager_id === filters.manager;
    const matchesStart = !filters.start || new Date(p.occupancy_start) >= new Date(filters.start);
    const matchesEnd = !filters.end || new Date(p.occupancy_end || new Date()) <= new Date(filters.end);
    return matchesProperty && matchesManager && matchesStart && matchesEnd;
  });

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Occupancy Periods</h1>

        {/* Form UI */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-4 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <select name="property_id" value={form.property_id} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600">
            <option value="">Select Property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <input name="tenant_name" value={form.tenant_name} onChange={handleChange} placeholder="Tenant Name" className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="occupancy_start" type="date" value={form.occupancy_start} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="occupancy_end" type="date" value={form.occupancy_end} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="lease_type" value={form.lease_type} onChange={handleChange} placeholder="Lease Type" className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="monthly_rent" type="number" value={form.monthly_rent} onChange={handleChange} placeholder="Monthly Rent" className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="col-span-full p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <button type="submit" className="col-span-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Add Occupancy Period</button>
        </form>

        {/* Filters moved below form */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={filters.property} onChange={(e) => setFilters({ ...filters, property: e.target.value })} className="p-2 rounded bg-[#0B1D33] border border-gray-600">
            <option value="">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select value={filters.manager} onChange={(e) => setFilters({ ...filters, manager: e.target.value })} className="p-2 rounded bg-[#0B1D33] border border-gray-600">
            <option value="">All Managers</option>
            {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <input type="date" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input type="date" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
        </div>
        {/* Form UI (unchanged) */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/20 p-4 rounded-xl mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <select name="property_id" value={form.property_id} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600">
            <option value="">Select Property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <input name="tenant_name" value={form.tenant_name} onChange={handleChange} placeholder="Tenant Name" className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="occupancy_start" type="date" value={form.occupancy_start} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="occupancy_end" type="date" value={form.occupancy_end} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="lease_type" value={form.lease_type} onChange={handleChange} placeholder="Lease Type" className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="monthly_rent" type="number" value={form.monthly_rent} onChange={handleChange} placeholder="Monthly Rent" className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="col-span-full p-2 rounded bg-[#0B1D33] border border-gray-600" />
          <button type="submit" className="col-span-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Add Occupancy Period</button>
        </form>

        {/* Table UI */}
        {filtered.length === 0 ? (
          <p className="text-gray-400">No occupancy periods found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-white/10 text-sm rounded-xl overflow-hidden">
              <thead className="bg-[#112244]">
                <tr>
                  <th className="p-2 text-left">Property</th>
                  <th className="p-2 text-left">Manager</th>
                  <th className="p-2 text-left">Tenant</th>
                  <th className="p-2 text-left">Lease Type</th>
                  <th className="p-2 text-left">Monthly Rent</th>
                  <th className="p-2 text-left">Start</th>
                  <th className="p-2 text-left">End</th>
                  <th className="p-2 text-left">Notes</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const property = properties.find(prop => prop.id === p.property_id);
                  const manager = managers.find(m => m.id === property?.property_manager_id);
                  return (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="p-2">{property?.title || p.property_id}</td>
                      <td className="p-2">{manager?.name || '—'}</td>
                      <td className="p-2">
                        {editingId === p.id ? (
                          <input defaultValue={p.tenant_name} onBlur={(e) => handleUpdate(p.id, { tenant_name: e.target.value })} className="bg-[#0B1D33] border border-gray-600 p-1 rounded w-full" />
                        ) : p.tenant_name}
                      </td>
                      <td className="p-2">
                        {editingId === p.id ? (
                          <input defaultValue={p.lease_type} onBlur={(e) => handleUpdate(p.id, { lease_type: e.target.value })} className="bg-[#0B1D33] border border-gray-600 p-1 rounded w-full" />
                        ) : p.lease_type}
                      </td>
                      <td className="p-2">
                        {editingId === p.id ? (
                          <input type="number" defaultValue={p.monthly_rent} onBlur={(e) => handleUpdate(p.id, { monthly_rent: parseFloat(e.target.value) })} className="bg-[#0B1D33] border border-gray-600 p-1 rounded w-full" />
                        ) : `$${p.monthly_rent?.toFixed(2)}`}
                      </td>
                      <td className="p-2">
                        {editingId === p.id ? (
                          <input type="date" defaultValue={p.occupancy_start} onBlur={(e) => handleUpdate(p.id, { occupancy_start: e.target.value })} className="bg-[#0B1D33] border border-gray-600 p-1 rounded w-full" />
                        ) : (p.occupancy_start ? format(new Date(p.occupancy_start), 'yyyy-MM-dd') : 'N/A')}
                      </td>
                      <td className="p-2">
                        {editingId === p.id ? (
                          <input type="date" defaultValue={p.occupancy_end} onBlur={(e) => handleUpdate(p.id, { occupancy_end: e.target.value })} className="bg-[#0B1D33] border border-gray-600 p-1 rounded w-full" />
                        ) : (p.occupancy_end ? format(new Date(p.occupancy_end), 'yyyy-MM-dd') : 'N/A')}
                      </td>
                      <td className="p-2">
                        {editingId === p.id ? (
                          <input defaultValue={p.notes} onBlur={(e) => handleUpdate(p.id, { notes: e.target.value })} className="bg-[#0B1D33] border border-gray-600 p-1 rounded w-full" />
                        ) : (p.notes || '—')}
                      </td>
                      <td className="p-2 space-x-2">
					    <button onClick={() => handleEdit(p.id)} className="text-blue-400 hover:underline">Edit</button>
					    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline">Delete</button>
					  </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
