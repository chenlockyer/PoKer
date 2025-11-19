
import React from 'react';
import { RotationMode, InteractionMode } from '../types';

interface UIOverlayProps {
  currentMode: RotationMode;
  setMode: (mode: RotationMode) => void;
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
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
  isFreezeMode,
  setIsFreezeMode,
  onClear,
  cardCount 
}) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">House of Cards</h1>
          <p className="text-gray-300 text-sm mt-1">Physics Construction Simulator</p>
          
          {/* Mode Toggle */}
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
      {interactionMode === InteractionMode.PRECISION && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center opacity-30">
          <div className="text-amber-400 border-2 border-amber-400 rounded-full w-12 h-12 flex items-center justify-center text-2xl mx-auto mb-2">+</div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex justify-between items-end w-full pointer-events-auto">
        
        <div className="flex gap-6 items-end">
            {/* Placement Modes (Only visible in Quick Mode) */}
            {interactionMode === InteractionMode.QUICK && (
              <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-gray-700 flex flex-col items-center gap-3">
              <span className="text-gray-300 text-xs uppercase tracking-widest self-start ml-1">Presets</span>
              <div className="flex gap-2">
                  {[
                  { mode: RotationMode.FLAT, label: 'Flat', icon: '▀', key: '1' },
                  { mode: RotationMode.VERTICAL_X, label: 'Stand X', icon: '▮', key: '2' },
                  { mode: RotationMode.VERTICAL_Z, label: 'Stand Z', icon: '▎', key: '3' },
                  { mode: RotationMode.TILTED_LEFT, label: 'Tilt /', icon: '/', key: '4' },
                  { mode: RotationMode.TILTED_RIGHT, label: 'Tilt \\', icon: '\\', key: '5' },
                  ].map((opt) => (
                  <button
                      key={opt.mode}
                      onClick={() => setMode(opt.mode)}
                      className={`
                      px-3 py-2 rounded-lg font-medium transition-all flex flex-col items-center min-w-[70px] relative
                      ${currentMode === opt.mode 
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
                      `}
                  >
                      <span className="absolute top-1 right-2 text-[9px] opacity-50 font-mono">{opt.key}</span>
                      <span className="text-lg mb-1 mt-1">{opt.icon}</span>
                      <span className="text-[10px]">{opt.label}</span>
                  </button>
                  ))}
              </div>
              </div>
            )}

            {/* Precision Controls UI */}
            {interactionMode === InteractionMode.PRECISION && (
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
                 <div className="text-xs text-gray-500">Drag handles to adjust</div>
                 <button 
                   id="precision-place-btn" // Used to trigger from outside if needed, or just visual cue
                   className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 active:transform active:scale-95 transition-all"
                   onClick={() => {
                     // Dispatch custom event for the canvas to pick up
                     window.dispatchEvent(new CustomEvent('trigger-precision-place'));
                   }}
                 >
                   <span>PLACE CARD</span>
                   <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono">ENTER</span>
                 </button>
               </div>
            )}

            {/* Physics Controls (Time Stop) */}
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
               <span>Toggle Mode</span>
               <span className="font-mono text-white bg-gray-700 px-1 rounded">TAB</span>
            </div>
            {interactionMode === InteractionMode.QUICK ? (
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
            ) : (
               <div className="col-span-2 text-amber-400 text-xs text-center italic py-1">
                  Use onscreen gizmo to position
               </div>
            )}
            <div className="flex justify-between">
              <span>Reset</span>
              <span className="font-mono text-white bg-gray-700 px-1 rounded">SPACE</span>
            </div>
            <div className="col-span-2 text-xs text-gray-500 mt-1 border-t border-gray-700 pt-2 text-center">
              {interactionMode === InteractionMode.QUICK ? 'Left Click to Place' : 'Press ENTER to Place'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UIOverlay;
