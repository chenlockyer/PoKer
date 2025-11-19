
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import PhysicsWorld from './PhysicsWorld';
import { CardData, RotationMode, InteractionMode } from '../types';

interface GameSceneProps {
  rotationMode: RotationMode;
  interactionMode: InteractionMode;
  isFreezeMode: boolean;
  cards: CardData[];
  addCard: (card: CardData) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ rotationMode, interactionMode, isFreezeMode, cards, addCard }) => {
  return (
    <div className="w-full h-full absolute top-0 left-0 z-0">
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="city" />
          
          <PhysicsWorld 
            rotationMode={rotationMode} 
            interactionMode={interactionMode}
            isFreezeMode={isFreezeMode}
            cards={cards} 
            addCard={addCard} 
          />

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going under floor
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameScene;
