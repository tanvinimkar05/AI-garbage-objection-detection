import React, { useState } from 'react';
import CameraFeed from './components/CameraFeed';
import MetricsDashboard from './components/MetricsDashboard';
import ModelGuide from './components/ModelGuide';
import { 
  Building2, 
  Home as HomeIcon, 
  GraduationCap, 
  Briefcase, 
  Map, 
  Volume2, 
  Bell, 
  ListFilter,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  { id: 'canteen', label: 'Canteen', icon: Building2 },
  { id: 'school', label: 'School', icon: GraduationCap },
  { id: 'office', label: 'Office', icon: Briefcase },
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'municipal', label: 'Municipal', icon: Map }
];

export default function App() {
  const [category, setCategory] = useState('canteen');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [threshold, setThreshold] = useState(4);
  const [activeDetections, setActiveDetections] = useState([]);
  const [cleanupDispatched, setCleanupDispatched] = useState(false);

  const isMessy = activeDetections.length >= threshold;

  // Handle mock cleanup dispatch
  const handleDispatchCleanup = () => {
    setCleanupDispatched(true);
    // Clear active detections to simulate cleanup
    setActiveDetections([]);
    setTimeout(() => {
      setCleanupDispatched(false);
    }, 3000);
  };

  return (
    <div className="app-container">
      {/* 1. Header Area */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">🌱</div>
          <div className="logo-text">
            <h1>CleanAware AI</h1>
            <p>Object Detection & Litter Awareness Hub</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`category-tab ${category === cat.id ? 'active' : ''}`}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Global Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isMessy ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
              color: 'var(--color-danger)', 
              padding: '0.4rem 0.8rem', 
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              <AlertTriangle size={13} />
              Status: Action Required
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              backgroundColor: 'rgba(16, 185, 129, 0.08)', 
              color: 'var(--color-success)', 
              padding: '0.4rem 0.8rem', 
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              <CheckCircle size={13} />
              Status: Clean Zone
            </div>
          )}
        </div>
      </header>

      {/* 2. Admin Alert Banner (Triggers if objects >= threshold) */}
      {isMessy && (
        <div className="admin-alert-banner">
          <div className="admin-alert-content">
            <ShieldAlert size={20} className="text-danger" />
            <span>
              <strong>ADMIN WARNING:</strong> Heavy clutter detected in the <strong>{category.toUpperCase()}</strong> zone ({activeDetections.length} objects). Dispatch action immediately.
            </span>
          </div>
          <button onClick={handleDispatchCleanup} className="admin-alert-btn">
            Dispatch Cleanup Crew
          </button>
        </div>
      )}

      {/* 3. Main Dashboard Grid */}
      <main className="dashboard-grid">
        
        {/* Left Column (Webcam Feed & Active Detections List) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <CameraFeed 
            category={category} 
            ttsEnabled={ttsEnabled}
            alarmEnabled={alarmEnabled}
            onDetectionsChange={setActiveDetections}
          />

          {/* Active Detections Inventory */}
          <div className="dash-card">
            <div className="card-header">
              <h3 className="card-title">
                <ListFilter size={18} className="text-primary" />
                Live Detected Objects Inventory
                <span className="live-pulse" style={{ marginLeft: '6px' }}></span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {activeDetections.length} items on floor
              </span>
            </div>

            {cleanupDispatched ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: 'var(--color-success)', 
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={32} />
                Cleanup Crew Dispatched! Room status cleared.
              </div>
            ) : activeDetections.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2.5rem', 
                color: 'var(--text-muted)', 
                fontSize: '0.85rem' 
              }}>
                ✨ No clutter detected. Keep up the good work!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="detections-table">
                  <thead>
                    <tr>
                      <th>Object Name</th>
                      <th>Category Type</th>
                      <th>Detection Confidence</th>
                      <th>Zone Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDetections.map((item, index) => (
                      <tr key={item.id + index}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</td>
                        <td>
                          <span className={`trash-badge ${item.type}`}>
                            {item.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {(item.confidence * 100).toFixed(1)}%
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {category.substring(0, 3).toUpperCase()}-L0{index + 1}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Controls, Alarms, Analytics Charts) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Settings Card */}
          <div className="dash-card">
            <div className="card-header">
              <h3 className="card-title">
                <Volume2 size={18} className="text-primary" />
                Alert System Controls
              </h3>
            </div>
            
            <div className="settings-panel">
              {/* TTS Voice Toggle */}
              <div className="setting-row">
                <div className="setting-info">
                  <h4>Voice Message Awareness</h4>
                  <p>Broadcasts warnings to litterers using browser TTS</p>
                </div>
                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    checked={ttsEnabled} 
                    onChange={(e) => setTtsEnabled(e.target.checked)} 
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Alarm Bypass Toggle */}
              <div className="setting-row">
                <div className="setting-info">
                  <h4>Audio Alarm Alert</h4>
                  <p>Bypasses mute, emits audible warning tone upon littering</p>
                </div>
                <label className="switch-container">
                  <input 
                    type="checkbox" 
                    checked={alarmEnabled} 
                    onChange={(e) => setAlarmEnabled(e.target.checked)} 
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Threshold Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Admin Alert Threshold:
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', marginLeft: 'auto' }}>
                    {threshold} Objects
                  </span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="5" 
                  value={threshold} 
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Triggers emergency notification to admin when object count matches this value.
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <MetricsDashboard detections={activeDetections} category={category} />

        </div>

        {/* Model Guide (Spans across both columns) */}
        <ModelGuide />

      </main>

      <footer className="footer">
        <p>© 2026 CleanAware AI • Environmental Awareness & Municipal Smart Cities Initiative</p>
      </footer>
    </div>
  );
}
