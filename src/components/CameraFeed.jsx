import React, { useState, useEffect, useRef } from 'react';
import { Camera, Video, Volume2, ShieldAlert } from 'lucide-react';

const MOCK_OBJECTS = {
  canteen: [
    { id: 'c1', name: 'Plastic Bottle', type: 'recyclable', confidence: 0.94, x: 80, y: 140, w: 70, h: 130 },
    { id: 'c2', name: 'Food Wrapper', type: 'trash', confidence: 0.88, x: 220, y: 250, w: 90, h: 60 },
    { id: 'c3', name: 'Aluminium Can', type: 'recyclable', confidence: 0.91, x: 420, y: 210, w: 60, h: 100 },
    { id: 'c4', name: 'Organic Waste', type: 'organic', confidence: 0.85, x: 150, y: 280, w: 100, h: 70 },
    { id: 'c5', name: 'Paper Cup', type: 'recyclable', confidence: 0.89, x: 340, y: 160, w: 65, h: 80 }
  ],
  school: [
    { id: 's1', name: 'Crumpled Paper', type: 'recyclable', confidence: 0.95, x: 120, y: 200, w: 60, h: 55 },
    { id: 's2', name: 'Plastic Ruler', type: 'recyclable', confidence: 0.81, x: 280, y: 270, w: 120, h: 30 },
    { id: 's3', name: 'Broken Pencil', type: 'trash', confidence: 0.87, x: 450, y: 150, w: 80, h: 20 },
    { id: 's4', name: 'Snack Packet', type: 'trash', confidence: 0.92, x: 190, y: 110, w: 75, h: 75 },
    { id: 's5', name: 'Juice Carton', type: 'recyclable', confidence: 0.90, x: 380, y: 230, w: 55, h: 90 }
  ],
  office: [
    { id: 'o1', name: 'Coffee Cup', type: 'trash', confidence: 0.96, x: 200, y: 130, w: 70, h: 90 },
    { id: 'o2', name: 'Sticky Note', type: 'trash', confidence: 0.87, x: 320, y: 240, w: 50, h: 50 },
    { id: 'o3', name: 'Cardboard Box', type: 'recyclable', confidence: 0.93, x: 410, y: 180, w: 130, h: 110 },
    { id: 'o4', name: 'Plastic Wrap', type: 'trash', confidence: 0.79, x: 90, y: 220, w: 80, h: 60 },
    { id: 'o5', name: 'Metal Clip', type: 'recyclable', confidence: 0.82, x: 280, y: 100, w: 40, h: 30 }
  ],
  home: [
    { id: 'h1', name: 'Apple Core', type: 'organic', confidence: 0.92, x: 140, y: 260, w: 50, h: 50 },
    { id: 'h2', name: 'Dust Clump', type: 'trash', confidence: 0.80, x: 380, y: 280, w: 80, h: 45 },
    { id: 'h3', name: 'Soda Can', type: 'recyclable', confidence: 0.97, x: 250, y: 160, w: 50, h: 95 },
    { id: 'h4', name: 'Empty Wrapper', type: 'trash', confidence: 0.89, x: 80, y: 180, w: 70, h: 50 },
    { id: 'h5', name: 'Torn Magazine', type: 'recyclable', confidence: 0.91, x: 440, y: 200, w: 100, h: 80 }
  ],
  municipal: [
    { id: 'm1', name: 'Plastic Bag', type: 'trash', confidence: 0.91, x: 150, y: 220, w: 110, h: 80 },
    { id: 'm2', name: 'Cigarette Butt', type: 'trash', confidence: 0.84, x: 360, y: 310, w: 35, h: 15 },
    { id: 'm3', name: 'Glass Bottle', type: 'recyclable', confidence: 0.95, x: 440, y: 240, w: 50, h: 110 },
    { id: 'm4', name: 'Cardboard Tray', type: 'recyclable', confidence: 0.88, x: 250, y: 180, w: 95, h: 60 },
    { id: 'm5', name: 'Fallen Leaves', type: 'organic', confidence: 0.76, x: 80, y: 290, w: 120, h: 60 }
  ]
};

const VOICE_MESSAGES = {
  canteen: "Please do not put the garbage here. There is a food waste bin present near the canteen counter. Please throw your garbage there. Thank you.",
  school: "Attention students: please do not litter in the hallways. A recycling bin is available next to the classroom entrance. Please dispose of waste properly.",
  office: "Please keep the office floor neat. Please throw cups and food wrappers into the kitchen pantry bins. Let's keep our workspace clean.",
  home: "Reminder: please place all household waste inside the designated trash baskets. Keep our home clean and healthy.",
  municipal: "Important Public Notice: Littering on public streets is strictly prohibited and subject to municipal fines. Please throw waste in the green and blue public garbage bins."
};

export default function CameraFeed({ category, ttsEnabled, alarmEnabled, onDetectionsChange }) {
  const [useWebcam, setUseWebcam] = useState(false);
  const [activeIds, setActiveIds] = useState(['1', '2', '3']); // starting with 3 items active
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const ttsPlayingTimeoutRef = useRef(null);
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  const currentCategoryObjects = MOCK_OBJECTS[category] || [];

  // Toggle active simulator objects
  const handleToggleObject = (mockIndex) => {
    const id = currentCategoryObjects[mockIndex]?.id;
    if (!id) return;
    
    let newActiveIds;
    if (activeIds.includes(id)) {
      newActiveIds = activeIds.filter(x => x !== id);
    } else {
      newActiveIds = [...activeIds, id];
      // Trigger voice warning on new detection if TTS is enabled
      triggerTTS();
    }
    setActiveIds(newActiveIds);
  };

  // Convert active items list and pass to parent
  useEffect(() => {
    const activeObjects = currentCategoryObjects.filter(obj => activeIds.includes(obj.id));
    onDetectionsChange(activeObjects);
  }, [activeIds, category]);

  // Update starting active items when category changes
  useEffect(() => {
    const defaultIds = currentCategoryObjects.slice(0, 3).map(x => x.id);
    setActiveIds(defaultIds);
  }, [category]);

  // Trigger Text To Speech warning
  const triggerTTS = () => {
    if (!ttsEnabled || isPlayingTts) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const message = VOICE_MESSAGES[category] || "Please place waste inside the trash bin.";
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setIsPlayingTts(true);
      };
      
      utterance.onend = () => {
        setIsPlayingTts(false);
      };

      utterance.onerror = () => {
        setIsPlayingTts(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback sound indicator
      playBeep(600, 0.4);
    }
  };

  // Trigger alarm sounds if alarm is active
  useEffect(() => {
    let intervalId;
    if (alarmEnabled && activeIds.length > 0) {
      intervalId = setInterval(() => {
        playBeep(880, 0.15);
      }, 800);
    }
    return () => clearInterval(intervalId);
  }, [alarmEnabled, activeIds]);

  // Browser Beep Helper
  const playBeep = (freq, duration) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio Context failed to play', e);
    }
  };

  // Webcam stream management
  useEffect(() => {
    let stream = null;
    if (useWebcam) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch(err => {
          console.warn("Webcam access denied, falling back to simulated imagery.", err);
          setUseWebcam(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useWebcam]);

  // Draw object detection boxes onto canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      currentCategoryObjects.forEach(obj => {
        if (!activeIds.includes(obj.id)) return;

        // Draw Bounding Box
        ctx.lineWidth = 2;
        let color = '#3b82f6'; // default primary blue
        if (obj.type === 'trash') color = '#f59e0b'; // amber
        if (obj.type === 'organic') color = '#10b981'; // green
        
        ctx.strokeStyle = color;
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);

        // Draw label background
        ctx.fillStyle = color;
        ctx.font = 'bold 11px Inter, sans-serif';
        const labelText = `${obj.name} [${Math.round(obj.confidence * 100)}%]`;
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(obj.x - 1, obj.y - 18, textWidth + 12, 18);

        // Draw text label
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, obj.x + 5, obj.y - 5);

        // Optional corner accents
        ctx.fillStyle = color;
        const cornerSize = 8;
        ctx.fillRect(obj.x - 2, obj.y - 2, cornerSize, 2);
        ctx.fillRect(obj.x - 2, obj.y - 2, 2, cornerSize);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentCategoryObjects, activeIds]);

  return (
    <div className="dash-card">
      <div className="card-header">
        <h3 className="card-title">
          <Camera size={18} className="text-primary" />
          Real-Time Detection Feed
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isPlayingTts && (
            <div className="sound-wave-container playing" title="Voice Warning Broadcast Active">
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
              <div className="sound-bar"></div>
            </div>
          )}
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            className="category-tab active"
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <Video size={13} />
            {useWebcam ? 'Simulated Feed' : 'Use Webcam'}
          </button>
        </div>
      </div>

      <div className="camera-view-container">
        {/* Camera info overlay */}
        <div className="camera-overlay-info">
          <div className="camera-status-dot rec"></div>
          <span>CAMERA_01_FEED // {category.toUpperCase()}_ZONE</span>
        </div>

        {useWebcam ? (
          <video
            ref={videoRef}
            className="camera-feed"
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className={`mock-scenery-bg mock-scenery-${category}`} />
        )}

        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          className="camera-feed-canvas"
        />
      </div>

      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Simulate Clutter Objects
        </h4>
        <div className="simulator-controls">
          {currentCategoryObjects.map((obj, i) => {
            const isActive = activeIds.includes(obj.id);
            return (
              <button
                key={obj.id}
                onClick={() => handleToggleObject(i)}
                className={`simulator-btn ${isActive ? 'active' : ''}`}
              >
                <span>{isActive ? '🔴 Remove' : '🟢 Add'}</span>
                <span>{obj.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
