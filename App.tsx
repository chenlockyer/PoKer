
import React, { useState, useCallback, useEffect } from 'react';
import GameScene from './components/GameScene';
import UIOverlay from './components/UIOverlay';
import { CardData, RotationMode, InteractionMode, PointerMode } from './types';

const App: React.FC = () => {
  const [rotationMode, setRotationMode] = useState<RotationMode>(RotationMode.FLAT);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(InteractionMode.QUICK);
  const [pointerMode, setPointerMode] = useState<PointerMode>(PointerMode.PLACE);
  const [isFreezeMode, setIsFreezeMode] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  const addCard = useCallback((card: CardData) => {
    // When adding a card, ensure it follows the current freeze mode
    const newCard = { ...card, locked: isFreezeMode };
    setCards(prev => [...prev, newCard]);
  }, [isFreezeMode]);

  const removeCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCard = useCallback((id: string, position: [number, number, number], rotation: [number, number, number]) => {
    setCards(prev => prev.map(c => 
      c.id === id 
        ? { ...c, position, rotation, locked: isFreezeMode } // Apply current freeze mode on move
        : c
    ));
  }, [isFreezeMode]);

  const clearCards = useCallback(() => {
    setCards([]);
  }, []);

  const toggleFreezeMode = useCallback((forceVal?: boolean) => {
    setIsFreezeMode(prev => {
      const newVal = forceVal !== undefined ? forceVal : !prev;
      // Update ALL existing cards to match the new mode (Global Freeze / Time Stop)
      setCards(currentCards => currentCards.map(c => ({ ...c, locked: newVal })));
      return newVal;
    });
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inputs if any exist
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      switch(e.key.toLowerCase()) {
        case '1': setRotationMode(RotationMode.FLAT); break;
        case '2': setRotationMode(RotationMode.STAND_X); break;
        case '3': setRotationMode(RotationMode.STAND_Y); break;
        case '4': setRotationMode(RotationMode.STAND_Z); break;
        case '5': setRotationMode(RotationMode.TILT_X_FWD); break;
        case '6': setRotationMode(RotationMode.TILT_X_BACK); break;
        case '7': setRotationMode(RotationMode.TILT_Z_LEFT); break;
        case '8': setRotationMode(RotationMode.TILT_Z_RIGHT); break;
        case '9': setRotationMode(RotationMode.ROOF_FWD); break;
        case '0': setRotationMode(RotationMode.ROOF_BACK); break;
        case 'l': toggleFreezeMode(); break;
        case 'tab': 
            e.preventDefault();
            setInteractionMode(prev => prev === InteractionMode.QUICK ? InteractionMode.PRECISION : InteractionMode.QUICK);
            break;
        case 'delete':
        case 'backspace':
            setPointerMode(PointerMode.DELETE);
            break;
        case 'escape':
            setPointerMode(PointerMode.PLACE);
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFreezeMode]);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      <GameScene 
        rotationMode={rotationMode} 
        interactionMode={interactionMode} 
        pointerMode={pointerMode}
        isFreezeMode={isFreezeMode}
        cards={cards} 
        addCard={addCard} 
        removeCard={removeCard}
        updateCard={updateCard}
        draggingCardId={draggingCardId}
        setDraggingCardId={setDraggingCardId}
      />
      
      <UIOverlay 
        currentMode={rotationMode}
        setMode={setRotationMode}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
        pointerMode={pointerMode}
        setPointerMode={setPointerMode}
        isFreezeMode={isFreezeMode}
        setIsFreezeMode={() => toggleFreezeMode()}
        onClear={clearCards}
        cardCount={cards.length}
      />
    </div>
  );
};

export default App;
