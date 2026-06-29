import { useState, useEffect } from 'react';
import api from '../../services/api';

const SuperAdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('requests');
  const [expandedShop, setExpandedShop] = useState(null); 

  // Nayi Initial State structure updates 🔒
  const [suspendModal, setSuspendModal] = useState(null); // admin object
  const [suspendForm, setSuspendForm] = useState({ 
    reason: '', 
    paymentDueDate: '', 
    holderName: '', 
    upi: '', 
    phone: '' 
  });

  // New shop form
  const [newShop, setNewShop] = useState({ 
    name: '', shopCode: '', location: '' 
  });
  const [shopLoading, setShopLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [reqRes, adminRes, shopRes] = await Promise.all([
        api.get('/superadmin/requests'),
        api.get('/superadmin/admins'),
        api.get('/superadmin/shops'),
      ]);
      setRequests(reqRes.data);
      setAdmins(adminRes.data);
      setShops(shopRes.data);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const { data } = await api.put(`/superadmin/requests/${id}/approve`);
      setMsg({ type: 'success', text: data.message });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this request?')) return;
    try {
      const { data } = await api.put(`/superadmin/requests/${id}/reject`);
      setMsg({ type: 'success', text: data.message });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    }
  };

  const handleRemoveAdmin = async (id, name) => {
    if (!window.confirm(`Remove ${name}'s admin access?`)) return;
    try {
      const { data } = await api.delete(`/superadmin/admins/${id}`);
      setMsg({ type: 'success', text: data.message });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    }
  };

  const handleCreateShop = async () => {
    if (!newShop.name || !newShop.shopCode) {
      return setMsg({ type: 'error', text: 'Name and shop code are required' });
    }
    setShopLoading(true);
    try {
      await api.post('/superadmin/shops', {
        ...newShop,
        shopCode: newShop.shopCode.toUpperCase(),
      });
      setMsg({ type: 'success', text: 'Shop created successfully!' });
      setNewShop({ name: '', shopCode: '', location: '' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    } finally {
      setShopLoading(false);
    }
  };

  const handleDeleteShop = async (id, name) => {
    if (!window.confirm(`Delete shop "${name}"?`)) return;
    try {
      await api.delete(`/superadmin/shops/${id}`);
      setMsg({ type: 'success', text: 'Shop deleted successfully' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="page-title">Super Admin Panel</h1>
        <p className="page-subtitle">Manage shops, admins and requests</p>

        {msg.text && (
          <div className={`alert alert-${msg.type}`}>{msg.text}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['requests', 'admins', 'shops'].map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'requests' && `⏳ Requests (${requests.length})`}
              {tab === 'admins' && `👑 Admins (${admins.length})`}
              {tab === 'shops' && `🏪 Shops (${shops.length})`}
            </button>
          ))}
        </div>

        {/* Pending Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                No pending requests
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.map((req) => (
                  <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>👤 {req.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📧 {req.email}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
                        {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => handleApprove(req.id)}>
                        ✅ Approve
                      </button>
                      <button className="btn btn-danger" onClick={() => handleReject(req.id)}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div>
            {admins.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                No admins found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {admins.map((admin) => (
                  <div key={admin.id} className="card" style={{ 
                    display: 'flex', justifyContent: 'space-between', 
                    alignItems: 'center', flexWrap: 'wrap', gap: 12,
                    borderColor: admin.status === 'suspended' ? 'var(--error)' : 'var(--border)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        💈 {admin.name}
                        {admin.status === 'suspended' && (
                          <span style={{
                            marginLeft: 8, fontSize: 10, background: 'var(--error)',
                            color: '#fff', borderRadius: 4, padding: '2px 6px',
                          }}>SUSPENDED</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📧 {admin.email}</div>
                      {admin.paymentDueDate && (
                        <div style={{ color: 'var(--warning)', fontSize: 12, marginTop: 2 }}>
                          📅 Due: {new Date(admin.paymentDueDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {admin.status === 'suspended' ? (
                        <button className="btn btn-primary" style={{ fontSize: 12 }}
                          onClick={async () => {
                            try {
                              const { data } = await api.put(`/superadmin/admins/${admin.id}/activate`);
                              setMsg({ type: 'success', text: data.message });
                              fetchData();
                            } catch (err) {
                              setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
                            }
                          }}>
                          ✅ Activate
                        </button>
                      ) : (
                        <button className="btn btn-outline" style={{ fontSize: 12, borderColor: 'var(--warning)', color: 'var(--warning)' }}
                          onClick={() => {
                            setSuspendModal(admin);
                            setSuspendForm({ reason: '', paymentDueDate: '', holderName: '', upi: '', phone: '' });
                          }}>
                          🔒 Suspend
                        </button>
                      )}
                      <button className="btn btn-danger" style={{ fontSize: 12 }}
                        onClick={() => handleRemoveAdmin(admin.id, admin.name)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: 16 }}>🏪 Create New Shop</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label>Shop Name</label>
                  <input
                    placeholder="e.g. NIT Jalandhar"
                    value={newShop.name}
                    onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Shop Code (Unique)</label>
                  <input
                    placeholder="e.g. NIT2024"
                    value={newShop.shopCode}
                    onChange={(e) => setNewShop({ ...newShop, shopCode: e.target.value.toUpperCase() })}
                    style={{ textTransform: 'uppercase', letterSpacing: 2 }}
                  />
                </div>
                <div className="form-group">
                  <label>Location (Optional)</label>
                  <input
                    placeholder="e.g. Jalandhar, Punjab"
                    value={newShop.location}
                    onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleCreateShop} disabled={shopLoading}>
                {shopLoading ? 'Creating...' : '+ Create Shop'}
              </button>
            </div>

            {/* Shops List */}
            {shops.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>
                No shops created yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {shops.map((shop) => (
                  <div key={shop.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>🏪 {shop.name}</div>
                        <div style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600, letterSpacing: 2 }}>
                          Code: {shop.shopCode}
                        </div>
                        {shop.location && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>
                            📍 {shop.location}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: 12, padding: '5px 12px' }}
                          onClick={() => setExpandedShop(expandedShop === shop.id ? null : shop.id)}
                        >
                          💈 {shop.members?.length || 0} Barber{shop.members?.length !== 1 ? 's' : ''} {expandedShop === shop.id ? '▲' : '▼'}
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDeleteShop(shop.id, shop.name)}>
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Barbers List */}
                    {expandedShop === shop.id && (
                      <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        {shop.members?.length === 0 ? (
                          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No barbers in this shop yet</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {shop.members.map((barber) => (
                              <div key={barber.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '8px 12px',
                                background: 'var(--bg-input)',
                                borderRadius: 8,
                              }}>
                                <span style={{ fontSize: 18 }}>💈</span>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>{barber.name}</div>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{barber.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Updated Suspend Modal Section 🔒 */}
        {suspendModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}>
            <div className="card" style={{ width: '100%', maxWidth: 420, borderColor: 'var(--error)' }}>
              <h3 style={{ color: 'var(--error)', marginBottom: 16 }}>🔒 Suspend {suspendModal.name}</h3>
              
              <div className="form-group">
                <label>Reason</label>
                <input placeholder="e.g. Payment pending for July"
                  value={suspendForm.reason}
                  onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Payment Due Date</label>
                <input type="date"
                  value={suspendForm.paymentDueDate}
                  onChange={(e) => setSuspendForm({ ...suspendForm, paymentDueDate: e.target.value })} />
              </div>
              
              {/* Teeno alag dynamic inputs replace kiye hain yahan */}
              <div className="form-group">
                <label>Account Holder Name</label>
                <input placeholder="e.g. Manish Kumar"
                  value={suspendForm.holderName}
                  onChange={(e) => setSuspendForm({ ...suspendForm, holderName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>UPI ID</label>
                <input placeholder="e.g. 9876543210@paytm"
                  value={suspendForm.upi}
                  onChange={(e) => setSuspendForm({ ...suspendForm, upi: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone / WhatsApp</label>
                <input placeholder="e.g. 9876543210"
                  value={suspendForm.phone}
                  onChange={(e) => setSuspendForm({ ...suspendForm, phone: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="btn btn-danger" style={{ flex: 1 }}
                  onClick={async () => {
                    try {
                      // API call me structured data pipeline string format me combine kiya h
                      const { data } = await api.put(`/superadmin/admins/${suspendModal.id}/suspend`, {
                        reason: suspendForm.reason,
                        paymentDueDate: suspendForm.paymentDueDate,
                        contact: `${suspendForm.holderName}|${suspendForm.upi}|${suspendForm.phone}`,
                      });
                      setMsg({ type: 'success', text: data.message });
                      setSuspendModal(null);
                      fetchData();
                    } catch (err) {
                      setMsg({ type: 'error', text: err.response?.data?.message || 'Error' });
                    }
                  }}>
                  Confirm Suspend
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSuspendModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperAdminDashboard;