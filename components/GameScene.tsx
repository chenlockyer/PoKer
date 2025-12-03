
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import PhysicsWorld from './PhysicsWorld';
import { CardData, RotationMode, InteractionMode, PointerMode } from '../types';

interface GameSceneProps {
  rotationMode: RotationMode;
  interactionMode: InteractionMode;
  pointerMode: PointerMode;
  isFreezeMode: boolean;
  cards: CardData[];
  addCard: (card: CardData) => void;
  removeCard: (id: string) => void;
  updateCard: (id: string, pos: [number, number, number], rot: [number, number, number]) => void;
  draggingCardId: string | null;
  setDraggingCardId: (id: string | null) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ 
  rotationMode, 
  interactionMode, 
  pointerMode,
  isFreezeMode, 
  cards, 
  addCard,
  removeCard,
  updateCard,
  draggingCardId,
  setDraggingCardId
}) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 z-0">
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="city" />
          
          <PhysicsWorld 
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

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under floor
            dampingFactor={0.05}
            enabled={!draggingCardId} // Disable controls when dragging a card!
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameScene;
