
import React, { useState, useCallback, useEffect } from 'react';
import GameScene from './components/GameScene';
import UIOverlay from './components/UIOverlay';
import { CardData, RotationMode, InteractionMode } from './types';

const App: React.FC = () => {
  const [rotationMode, setRotationMode] = useState<RotationMode>(RotationMode.FLAT);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(InteractionMode.QUICK);
  const [isFreezeMode, setIsFreezeMode] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]);

  const addCard = useCallback((card: CardData) => {
    // When adding a card, ensure it follows the current freeze mode
    const newCard = { ...card, locked: isFreezeMode };
    setCards(prev => [...prev, newCard]);
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
        case '2': setRotationMode(RotationMode.VERTICAL_X); break;
        case '3': setRotationMode(RotationMode.VERTICAL_Z); break;
        case '4': setRotationMode(RotationMode.TILTED_LEFT); break;
        case '5': setRotationMode(RotationMode.TILTED_RIGHT); break;
        case 'l': toggleFreezeMode(); break;
        case 'tab': 
            e.preventDefault();
            setInteractionMode(prev => prev === InteractionMode.QUICK ? InteractionMode.PRECISION : InteractionMode.QUICK);
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
        isFreezeMode={isFreezeMode}
        cards={cards} 
        addCard={addCard} 
      />
      
      <UIOverlay 
        currentMode={rotationMode}
        setMode={setRotationMode}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
        isFreezeMode={isFreezeMode}
        setIsFreezeMode={() => toggleFreezeMode()}
        onClear={clearCards}
        cardCount={cards.length}
      />
    </div>
  );
};

export default App;
