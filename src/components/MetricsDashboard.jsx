import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';

const COLORS = {
  recyclable: '#3b82f6', // blue
  trash: '#f59e0b',      // amber
  organic: '#10b981'     // green
};

export default function MetricsDashboard({ detections, category }) {
  // 1. Calculate waste breakdown based on active items
  const counts = { recyclable: 0, trash: 0, organic: 0 };
  detections.forEach(obj => {
    if (counts[obj.type] !== undefined) {
      counts[obj.type]++;
    }
  });

  const pieData = [
    { name: 'Recyclable', value: counts.recyclable || 0.1, color: COLORS.recyclable },
    { name: 'Trash', value: counts.trash || 0.1, color: COLORS.trash },
    { name: 'Organic', value: counts.organic || 0.1, color: COLORS.organic }
  ].filter(item => item.value > 0);

  // 2. Historical Mock Data based on Categories
  const categoryTrends = {
    canteen: [
      { hour: '08:00', messLevel: 10, cleanUps: 2 },
      { hour: '10:00', messLevel: 25, cleanUps: 1 },
      { hour: '12:00', messLevel: 80, cleanUps: 5 },
      { hour: '14:00', messLevel: 95, cleanUps: 8 },
      { hour: '16:00', messLevel: 40, cleanUps: 4 },
      { hour: '18:00', messLevel: 60, cleanUps: 3 },
      { hour: '20:00', messLevel: 15, cleanUps: 2 }
    ],
    school: [
      { hour: '08:00', messLevel: 5, cleanUps: 1 },
      { hour: '10:00', messLevel: 45, cleanUps: 3 },
      { hour: '12:00', messLevel: 75, cleanUps: 6 },
      { hour: '14:00', messLevel: 30, cleanUps: 4 },
      { hour: '16:00', messLevel: 85, cleanUps: 7 },
      { hour: '18:00', messLevel: 10, cleanUps: 2 },
      { hour: '20:00', messLevel: 2, cleanUps: 0 }
    ],
    office: [
      { hour: '08:00', messLevel: 12, cleanUps: 1 },
      { hour: '10:00', messLevel: 30, cleanUps: 2 },
      { hour: '12:00', messLevel: 55, cleanUps: 3 },
      { hour: '14:00', messLevel: 45, cleanUps: 2 },
      { hour: '16:00', messLevel: 65, cleanUps: 4 },
      { hour: '18:00', messLevel: 20, cleanUps: 3 },
      { hour: '20:00', messLevel: 5, cleanUps: 1 }
    ],
    home: [
      { hour: '08:00', messLevel: 15, cleanUps: 1 },
      { hour: '10:00', messLevel: 20, cleanUps: 0 },
      { hour: '12:00', messLevel: 40, cleanUps: 1 },
      { hour: '14:00', messLevel: 30, cleanUps: 2 },
      { hour: '16:00', messLevel: 50, cleanUps: 1 },
      { hour: '18:00', messLevel: 75, cleanUps: 3 },
      { hour: '20:00', messLevel: 35, cleanUps: 2 }
    ],
    municipal: [
      { hour: '08:00', messLevel: 50, cleanUps: 4 },
      { hour: '10:00', messLevel: 70, cleanUps: 5 },
      { hour: '12:00', messLevel: 90, cleanUps: 8 },
      { hour: '14:00', messLevel: 85, cleanUps: 9 },
      { hour: '16:00', messLevel: 60, cleanUps: 6 },
      { hour: '18:00', messLevel: 75, cleanUps: 7 },
      { hour: '20:00', messLevel: 40, cleanUps: 4 }
    ]
  };

  const trendData = categoryTrends[category] || categoryTrends.canteen;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Real-time Waste Distribution (Pie Chart) */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">
            <PieIcon size={18} className="text-primary" />
            Active Clutter Distribution
          </h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', height: '180px', justifyContent: 'center' }}>
          {detections.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              No trash detected. Area is clean! ✨
            </div>
          ) : (
            <>
              <div style={{ width: '50%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Math.round(value)} items`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '50%' }}>
                {pieData.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.name}: {detections.filter(d => d.type === item.name.toLowerCase()).length}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Mess Level & Daily Trends */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={18} className="text-primary" />
            24H Mess Level Trend (%)
          </h3>
        </div>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}% Clutter`]} />
              <Line type="monotone" dataKey="messLevel" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Dispatch & Cleanup Efficiency */}
      <div className="dash-card">
        <div className="card-header">
          <h3 className="card-title">
            <BarChart2 size={18} className="text-primary" />
            Admin Clean-up Dispatches
          </h3>
        </div>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(value) => [`${value} Dispatches`]} />
              <Bar dataKey="cleanUps" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
