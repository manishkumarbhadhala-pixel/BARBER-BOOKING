import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const MonthlyIncome = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Years list — last 3 saal
  const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];

  useEffect(() => { fetchIncome(); }, [month, year]);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const { data: res } = await adminAPI.getMonthlyIncome(month, year);
      setData(res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', weekday: 'short',
  });

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-header">
          <div>
            <h1 className="page-title">Monthly Income</h1>
            <p className="page-subtitle">{MONTHS[month - 1]} {year}</p>
          </div>

          {/* Month + Year Selector */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              style={{
                padding: '8px 12px', background: 'var(--bg-input)',
                border: '1px solid var(--border)', color: 'var(--text-primary)',
                borderRadius: 'var(--radius)', fontSize: 14, outline: 'none',
              }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{
                padding: '8px 12px', background: 'var(--bg-input)',
                border: '1px solid var(--border)', color: 'var(--text-primary)',
                borderRadius: 'var(--radius)', fontSize: 14, outline: 'none',
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <>
            {/* Total Card */}
            <div className="card" style={{ marginBottom: 20, borderColor: 'var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Total Income — {MONTHS[month - 1]} {year}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{data?.totalIncome?.toFixed(2) || '0.00'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {data?.completedCount || 0} services completed
                  </div>
                </div>
                <div style={{ fontSize: 48 }}>💰</div>
              </div>
            </div>

            {data?.completedCount === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                No completed services in {MONTHS[month - 1]} {year}
              </div>
            ) : (
              <>
                {/* Service Breakdown */}
                <div className="card" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                    Service Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(data?.breakdown || {}).map(([service, info]) => (
                      <div key={service} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 8,
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>✂ {service}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {info.count} × ₹{info.price}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 16 }}>
                          ₹{info.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day Wise Breakdown */}
                <div className="card">
                  <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                    Day Wise
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(data?.dayWise || {}).map(([date, info]) => (
                      <div key={date} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 8,
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{formatDate(date)}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {info.count} services
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>
                          ₹{info.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyIncome;