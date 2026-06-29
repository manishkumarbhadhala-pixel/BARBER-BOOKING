import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [newService, setNewService] = useState({ name: '', displayName: '', price: '', durationMinutes: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const { data } = await adminAPI.getServices();
      setServices(data);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load service' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (service) => {
    try {
      await adminAPI.updateService(service.id, {
        price: service.price,
        durationMinutes: service.durationMinutes,
      });
      setMsg({ type: 'success', text: `${service.displayName} updated!` });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Update failed' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" Want to delete?`)) return;
    try {
      await adminAPI.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setMsg({ type: 'success', text: 'Service deleted successfully' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Delete failed' });
    }
  };

  const handleAdd = async () => {
    if (!newService.name || !newService.displayName || !newService.price || !newService.durationMinutes) {
      return setMsg({ type: 'error', text: 'Fill all fields' });
    }
    setAdding(true);
    try {
      const { data } = await adminAPI.addService(newService);
      setServices((prev) => [...prev, data]);
      setNewService({ name: '', displayName: '', price: '', durationMinutes: '' });
      setMsg({ type: 'success', text: 'Service added successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Add failed' });
    } finally {
      setAdding(false);
    }
  };

  const handleChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((s) => s.id === id ? { ...s, [field]: value } : s)
    );
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="page-title">Services</h1>
        <p className="page-subtitle">Manage price and duration</p>

        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {/* Existing Services */}
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="card">
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {service.name === 'haircut' ? '✂️' : service.name === 'haircut_beard' ? '✂️🧔' : '💈'}
              </div>
              <h3 style={{ color: 'var(--primary)', marginBottom: 16 }}>{service.displayName}</h3>

              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" value={service.price}
                  onChange={(e) => handleChange(service.id, 'price', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input type="number" value={service.durationMinutes}
                  onChange={(e) => handleChange(service.id, 'durationMinutes', e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}
                  onClick={() => handleUpdate(service)}>Save</button>
                <button className="btn btn-danger"
                  onClick={() => handleDelete(service.id, service.displayName)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Service */}
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: 16 }}>➕ Add new Service </h3>
          <div className="services-grid">
            <div className="form-group">
              <label>Name (unique, no spaces)</label>
              <input placeholder="e.g. kids_haircut" value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Display Name</label>
              <input placeholder="Service name" value={newService.displayName}
                onChange={(e) => setNewService({ ...newService, displayName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" placeholder="100" value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input type="number" placeholder="15" value={newService.durationMinutes}
                onChange={(e) => setNewService({ ...newService, durationMinutes: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} disabled={adding}>
            {adding ? 'Adding...' : 'Add Service'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageServices;