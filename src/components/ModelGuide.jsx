import React, { useState } from 'react';
import { Database, Cpu, Terminal, BookOpen, Code, Layers } from 'lucide-react';

export default function ModelGuide() {
  const [activeTab, setActiveTab] = useState('datasets');

  const pythonTrainingCode = `import cv2
from ultralytics import YOLO

# 1. Load the pre-trained YOLOv8 Nano model (suitable for real-time edge devices)
model = YOLO('yolov8n.pt')

# 2. Train the model on your custom dataset (e.g. TACO & Canteen trash annotation dataset)
# Your dataset yaml should contain paths to train/val images and class names
results = model.train(
    data='trash_dataset.yaml', 
    epochs=100, 
    imgsz=640, 
    device='0', # Use GPU (CUDA) if available
    batch=16
)

# 3. Save & validate model
metrics = model.val()
print(f"Validation Mean Average Precision (mAP50-95): {metrics.box.map}")

# 4. Export the model to ONNX format for browser-based client execution
model.export(format='onnx', imgsz=640, optimize=True)
`;

  const nodeApiCode = `// Python script running on an Edge Raspberry Pi Node with OpenCV & WebSockets
import cv2
import json
import asyncio
import websockets
from ultralytics import YOLO

model = YOLO('best.pt') # Your custom trained model
cap = cv2.VideoCapture(0) # USB Camera feed

async def detect_and_stream(websocket, path):
    print("Dashboard client connected.")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Inference using YOLOv8
        results = model(frame, conf=0.5)[0]
        detections = []
        
        for box in results.boxes:
            cls_id = int(box.cls[0])
            name = results.names[cls_id]
            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist() # Bounding box coordinates
            
            detections.append({
                "name": name,
                "confidence": conf,
                "box": xyxy
            })
            
        # Send raw detection and image metadata to the Admin Dashboard
        payload = {
            "node_id": "canteen_cam_01",
            "active_objects_count": len(detections),
            "detections": detections
        }
        
        await websocket.send(json.dumps(payload))
        await asyncio.sleep(0.1) # Limit feed to 10 FPS for network efficiency

start_server = websockets.serve(detect_and_stream, "0.0.0.0", 8765)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
`;

  return (
    <div className="dash-card model-guide-tab">
      <div className="card-header">
        <h3 className="card-title">
          <BookOpen size={18} className="text-primary" />
          Model Training & Dataset Integration Guide
        </h3>
        <div className="guide-tabs">
          <button
            onClick={() => setActiveTab('datasets')}
            className={`guide-tab-btn ${activeTab === 'datasets' ? 'active' : ''}`}
          >
            <Database size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Datasets
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`guide-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          >
            <Code size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Training Pipeline
          </button>
          <button
            onClick={() => setActiveTab('edge')}
            className={`guide-tab-btn ${activeTab === 'edge' ? 'active' : ''}`}
          >
            <Cpu size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Edge Camera Node (Python)
          </button>
        </div>
      </div>

      <div className="guide-content">
        {activeTab === 'datasets' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
              To train a robust classifier capable of running in multiple settings (canteen, municipal, school, office), we recommend combining annotations from the following public datasets with custom environment images:
            </p>
            <div className="dataset-grid">
              <div className="dataset-card">
                <span className="dataset-name">
                  <Layers size={15} className="text-primary" /> TACO Dataset
                </span>
                <span className="dataset-desc">
                  Trash Annotations in Context. Open image dataset of waste in various settings containing pixel-level segmentations.
                </span>
                <span className="dataset-stats">
                  Target: Municipal & Out-of-home areas • 1,500+ annotated images • 60 categories
                </span>
              </div>

              <div className="dataset-card">
                <span className="dataset-name">
                  <Layers size={15} className="text-primary" /> TrashNet
                </span>
                <span className="dataset-desc">
                  Standard dataset created by Stanford students containing isolated recyclables and garbage on solid white backgrounds.
                </span>
                <span className="dataset-stats">
                  Target: Organic/Recycling Sort • 2,527 images • 6 categories
                </span>
              </div>

              <div className="dataset-card">
                <span className="dataset-name">
                  <Layers size={15} className="text-primary" /> MJU-Waste
                </span>
                <span className="dataset-desc">
                  Indoor waste detection dataset taken in university settings, featuring plastic drink bottles, paper cups, and snack packs.
                </span>
                <span className="dataset-stats">
                  Target: School & Office settings • 2,000+ co-located images
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--color-success)' }}>
              <strong>💡 Pro Tip: Custom Data Augmentation</strong>
              <p style={{ marginTop: '0.25rem' }}>
                For specific sites like your office canteen or school grounds, take 100-200 pictures of clean tables vs messy tables, annotate them using Roboflow or LabelImg, and merge them with TACO to boost accuracy to 95%+.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
              We recommend using the **YOLOv8 Nano (yolov8n)** or **YOLOv9-t** architectures. They are highly optimized for inference speed on edge microcontrollers (like Raspberry Pi / Jetson Nano) and browser runtimes.
            </p>
            <div className="code-container">
              <pre>{pythonTrainingCode}</pre>
            </div>
          </div>
        )}

        {activeTab === 'edge' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
              Run this script on your edge computing nodes (e.g. Raspberry Pi 5 + USB camera) to capture live frames, run local object detection with hardware accelerators, and stream real-time JSON payloads back to this web dashboard.
            </p>
            <div className="code-container">
              <pre>{nodeApiCode}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
