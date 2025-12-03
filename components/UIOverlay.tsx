
import React from 'react';
import { RotationMode, InteractionMode, PointerMode } from '../types';

interface UIOverlayProps {
  currentMode: RotationMode;
  setMode: (mode: RotationMode) => void;
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
  pointerMode: PointerMode;
  setPointerMode: (mode: PointerMode) => void;
  isFreezeMode: boolean;
  setIsFreezeMode: (val: boolean) => void;
  onClear: () => void;
  cardCount: number;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  currentMode, 
  setMode, 
  interactionMode,
  setInteractionMode,
  pointerMode,
  setPointerMode,
  isFreezeMode,
  setIsFreezeMode,
  onClear,
  cardCount 
}) => {
  
  const presets = [
      { mode: RotationMode.FLAT, label: 'Flat', icon: '▀', key: '1' },
      { mode: RotationMode.STAND_X, label: 'Stand X', icon: '▮', key: '2' },
      { mode: RotationMode.STAND_Y, label: 'Stand Y', icon: '▬', key: '3' },
      { mode: RotationMode.STAND_Z, label: 'Stand Z', icon: '▎', key: '4' },
      { mode: RotationMode.TILT_X_FWD, label: 'Lean Fwd', icon: '◢', key: '5' },
      { mode: RotationMode.TILT_X_BACK, label: 'Lean Back', icon: '◣', key: '6' },
      { mode: RotationMode.TILT_Z_LEFT, label: 'Lean Left', icon: '◤', key: '7' },
      { mode: RotationMode.TILT_Z_RIGHT, label: 'Lean Right', icon: '◥', key: '8' },
      { mode: RotationMode.ROOF_FWD, label: 'Roof Fwd', icon: '▲', key: '9' },
      { mode: RotationMode.ROOF_BACK, label: 'Roof Back', icon: '▼', key: '0' },
  ];

  const showPlaceControls = pointerMode === PointerMode.PLACE || pointerMode === PointerMode.MOVE;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">House of Cards</h1>
          <p className="text-gray-300 text-sm mt-1">Physics Construction Simulator</p>
          
          {/* Mode Toggle (Quick/Precision) - Only for Place Mode */}
          {pointerMode === PointerMode.PLACE && (
            <div className="mt-4 bg-black/60 backdrop-blur rounded-lg p-1 inline-flex border border-gray-700">
              <button 
                onClick={() => setInteractionMode(InteractionMode.QUICK)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${interactionMode === InteractionMode.QUICK ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Quick Place
              </button>
              <button 
                onClick={() => setInteractionMode(InteractionMode.PRECISION)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${interactionMode === InteractionMode.PRECISION ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Precision (Blender)
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 items-end">
           <div className="bg-black/50 backdrop-blur-md p-4 rounded-lg border border-gray-600 text-right">
             <div className="text-white text-xs uppercase tracking-wider">Cards Placed</div>
             <div className="text-3xl font-mono text-blue-400">{cardCount}</div>
           </div>
           
           <button 
             onClick={onClear}
             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors shadow-lg"
           >
             Clear Table
           </button>
        </div>
      </div>

      {/* Center Notification for Precision Mode */}
      {pointerMode === PointerMode.PLACE && interactionMode === InteractionMode.PRECISION && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center opacity-30">
          <div className="text-amber-400 border-2 border-amber-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl mx-auto mb-2">+</div>
        </div>
      )}

      {/* MAIN POINTER MODE TOOLBAR (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50">
        <div className="bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-600 flex gap-1 shadow-2xl">
           <button
             onClick={() => setPointerMode(PointerMode.PLACE)}
             className={`px-6 py-3 rounded-xl font-bold text-sm uppercase transition-all flex items-center gap-2 ${pointerMode === PointerMode.PLACE ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
           >
             <span className="text-lg">✚</span> Place
           </button>
           <button
             onClick={() => setPointerMode(PointerMode.MOVE)}
             className={`px-6 py-3 rounded-xl font-bold text-sm uppercase transition-all flex items-center gap-2 ${pointerMode === PointerMode.MOVE ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
           >
             <span className="text-lg">✋</span> Move
           </button>
           <button
             onClick={() => setPointerMode(PointerMode.DELETE)}
             className={`px-6 py-3 rounded-xl font-bold text-sm uppercase transition-all flex items-center gap-2 ${pointerMode === PointerMode.DELETE ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
           >
             <span className="text-lg">✕</span> Delete
           </button>
        </div>
      </div>


      {/* Bottom Sections (Side Controls) */}
      <div className="flex justify-between items-end w-full pointer-events-auto mb-16"> {/* mb-16 to clear center toolbar */}
        
        <div className="flex gap-6 items-end">
            {/* Presets - Visible in Place or Move Mode */}
            {showPlaceControls && interactionMode === InteractionMode.QUICK && (
              <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-gray-700 flex flex-col gap-2">
                <span className="text-gray-300 text-xs uppercase tracking-widest self-start ml-1">Presets</span>
                <div className="grid grid-cols-5 gap-2">
                    {presets.map((opt) => (
                    <button
                        key={opt.mode}
                        onClick={() => setMode(opt.mode)}
                        className={`
                        p-2 rounded-lg font-medium transition-all flex flex-col items-center w-[60px] relative
                        ${currentMode === opt.mode 
                            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105 z-10' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
                        `}
                    >
                        <span className="absolute top-0.5 right-1.5 text-[8px] opacity-50 font-mono">{opt.key}</span>
                        <span className="text-lg leading-none mt-1 mb-1">{opt.icon}</span>
                        <span className="text-[9px] leading-tight text-center">{opt.label}</span>
                    </button>
                    ))}
                </div>
              </div>
            )}

            {/* Precision Controls */}
            {pointerMode === PointerMode.PLACE && interactionMode === InteractionMode.PRECISION && (
               <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-amber-600/50 flex flex-col gap-3 shadow-[0_0_30px_rgba(217,119,6,0.15)]">
                 <span className="text-amber-400 text-xs uppercase tracking-widest font-bold">Precision Tool</span>
                 <div className="flex items-center gap-4 text-gray-300 text-sm">
                    <div className="flex gap-2">
                      <span className="bg-gray-700 px-2 py-1 rounded text-white font-mono">T</span> Translate
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-gray-700 px-2 py-1 rounded text-white font-mono">R</span> Rotate
                    </div>
                 </div>
                 <button 
                   id="precision-place-btn" 
                   className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 active:transform active:scale-95 transition-all"
                   onClick={() => {
                     window.dispatchEvent(new CustomEvent('trigger-precision-place'));
                   }}
                 >
                   <span>PLACE CARD</span>
                   <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono">ENTER</span>
                 </button>
               </div>
            )}

            {/* Physics Controls (Time Stop) - Always Visible */}
            <button
                onClick={() => setIsFreezeMode(!isFreezeMode)}
                className={`
                    px-6 py-4 rounded-xl font-bold text-sm transition-all border relative shadow-xl flex items-center gap-3 h-[110px]
                    ${isFreezeMode 
                        ? 'bg-cyan-900/90 border-cyan-400 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.4)]' 
                        : 'bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700'}
                `}
            >
                <span className={`text-4xl ${isFreezeMode ? 'animate-pulse' : ''}`}>
                    {isFreezeMode ? '⏸' : '▶'}
                </span>
                <div className="flex flex-col items-start">
                    <span className={`uppercase tracking-wider text-[10px] mb-1 ${isFreezeMode ? 'text-cyan-300' : 'text-gray-500'}`}>
                        {isFreezeMode ? 'Time Stopped' : 'Physics Active'}
                    </span>
                    <span className="text-lg tracking-tight">
                        {isFreezeMode ? 'RESUME' : 'FREEZE'}
                    </span>
                    <span className="text-[10px] font-mono opacity-50 mt-1">Press 'L'</span>
                </div>
            </button>
        </div>

        {/* Controls Guide */}
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-gray-700 ml-4">
          <span className="text-gray-300 text-xs uppercase tracking-widest mb-2 block">Controls</span>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Toggle Precision</span>
              <span className="font-mono text-white bg-gray-700 px-1 rounded">TAB</span>
            </div>
            
            {showPlaceControls && interactionMode === InteractionMode.QUICK && (
              <>
                <div className="flex justify-between">
                  <span>Rotate (Yaw)</span>
                  <span className="font-mono text-white bg-gray-700 px-1 rounded">Q / E</span>
                </div>
                <div className="flex justify-between">
                  <span>Tilt (Pitch)</span>
                  <span className="font-mono text-white bg-gray-700 px-1 rounded">R / F</span>
                </div>
                <div className="flex justify-between">
                  <span>Roll (Z-Axis)</span>
                  <span className="font-mono text-white bg-gray-700 px-1 rounded">Z / X</span>
                </div>
              </>
            )}

            {pointerMode === PointerMode.MOVE && (
                <div className="col-span-2 text-blue-400 text-xs py-1">
                   Drag blue cards to move them.
                </div>
            )}
            
            {pointerMode === PointerMode.DELETE && (
                <div className="col-span-2 text-red-400 text-xs py-1">
                   Click red cards to delete.
                </div>
            )}

            <div className="flex justify-between">
              <span>Reset Rot</span>
              <span className="font-mono text-white bg-gray-700 px-1 rounded">SPACE</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UIOverlay;
