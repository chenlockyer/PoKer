
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Physics, usePlane } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import Card from './Card';
import { CardData, RotationMode, InteractionMode, PointerMode } from '../types';

const CARD_WIDTH = 2.0;
const CARD_HEIGHT = 2.8;
const CARD_THICKNESS = 0.02;

interface PhysicsWorldProps {
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

// The Floor component
const Floor = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 1, restitution: 0 }
  }));

  return (
    <mesh ref={ref as any} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial opacity={0.3} />
      <gridHelper args={[100, 100, 0x444444, 0x222222]} rotation={[-Math.PI / 2, 0, 0]} />
    </mesh>
  );
};

// The Ghost Card follows the mouse to show where a card will be placed
const GhostCard = ({ 
  rotationMode, 
  isFreezeMode,
  onPlace,
  dragMode = false // If true, we place on mouse UP, not click
}: { 
  rotationMode: RotationMode; 
  isFreezeMode: boolean;
  onPlace: (pos: THREE.Vector3, rot: THREE.Euler) => void;
  dragMode?: boolean;
}) => {
  const { camera, raycaster, scene } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0));
  
  // Custom Rotation Offsets
  const [yaw, setYaw] = useState(0);   
  const [pitch, setPitch] = useState(0); 
  const [roll, setRoll] = useState(0);   

  // Track mouse down position to distinguish between Click and Drag (Camera Orbit)
  const clickStartRef = useRef<{x: number, y: number} | null>(null);

  // Handle Input for Rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ROT_SPEED = 0.1; // Radians
      switch(e.key.toLowerCase()) {
        case 'q': setYaw(y => y + ROT_SPEED); break;
        case 'e': setYaw(y => y - ROT_SPEED); break;
        case 'r': setPitch(p => p - ROT_SPEED); break; 
        case 'f': setPitch(p => p + ROT_SPEED); break; 
        case 'z': setRoll(r => r - ROT_SPEED); break; 
        case 'x': setRoll(r => r + ROT_SPEED); break; 
        case ' ': setYaw(0); setPitch(0); setRoll(0); break; 
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 10) {
        const speed = 0.002;
        setYaw(y => y + e.deltaY * speed);
      }
    };

    // Track pointer down for drag detection
    const handlePointerDown = (e: PointerEvent) => {
      clickStartRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  // Reset pitch/roll when mode changes (only if not dragging to preserve flow? simple is best)
  useEffect(() => {
    setPitch(0);
    setRoll(0);
  }, [rotationMode]);

  const targetRotation = useMemo(() => {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    
    let basePitch = 0; 
    let baseRoll = 0;  
    let baseYaw = 0;   

    switch (rotationMode) {
      case RotationMode.FLAT: basePitch = 0; break;
      case RotationMode.STAND_X: basePitch = Math.PI / 2; break;
      case RotationMode.STAND_Y: basePitch = Math.PI / 2; baseYaw = Math.PI / 2; break;
      case RotationMode.STAND_Z: baseRoll = Math.PI / 2; break;
      case RotationMode.TILT_X_FWD: basePitch = Math.PI / 2 - 0.35; break;
      case RotationMode.TILT_X_BACK: basePitch = Math.PI / 2 + 0.35; break;
      case RotationMode.TILT_Z_LEFT: baseRoll = Math.PI / 2 - 0.35; break;
      case RotationMode.TILT_Z_RIGHT: baseRoll = Math.PI / 2 + 0.35; break;
      case RotationMode.ROOF_FWD: basePitch = Math.PI / 2 - 0.78; break;
      case RotationMode.ROOF_BACK: basePitch = Math.PI / 2 + 0.78; break;
    }

    euler.x = basePitch + pitch;
    euler.y = baseYaw + yaw;
    euler.z = baseRoll + roll;

    return euler;
  }, [rotationMode, yaw, pitch, roll]);

  useFrame(({ mouse }) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Ignore self and hidden cards
    const hit = intersects.find(i => 
      i.object !== meshRef.current && 
      i.object.type === 'Mesh' &&
      (i.object.name !== 'ghost') &&
      i.object.visible // Ignore hidden cards (dragging source)
    );

    if (hit && hit.face) {
      // Anti-clipping projection
      const hitNormal = hit.face.normal.clone();
      hitNormal.transformDirection(hit.object.matrixWorld).normalize();

      const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(targetRotation);

      const cardXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotationMatrix); 
      const cardYAxis = new THREE.Vector3(0, 1, 0).applyMatrix4(rotationMatrix); 
      const cardZAxis = new THREE.Vector3(0, 0, 1).applyMatrix4(rotationMatrix);

      const halfWidth = CARD_WIDTH / 2;
      const halfThickness = CARD_THICKNESS / 2;
      const halfHeight = CARD_HEIGHT / 2;

      const projectedRadius = 
        Math.abs(cardXAxis.dot(hitNormal)) * halfWidth +
        Math.abs(cardYAxis.dot(hitNormal)) * halfThickness +
        Math.abs(cardZAxis.dot(hitNormal)) * halfHeight;

      const offsetVector = hitNormal.multiplyScalar(projectedRadius + 0.001);
      const newPos = hit.point.clone().add(offsetVector);

      const isFloor = Math.abs(hitNormal.y) > 0.9;
      if (isFloor) {
        const SNAP = 0.1; 
        newPos.x = Math.round(newPos.x / SNAP) * SNAP;
        newPos.z = Math.round(newPos.z / SNAP) * SNAP;
      }
      
      if (meshRef.current) {
        meshRef.current.position.lerp(newPos, 0.5);
        meshRef.current.rotation.copy(targetRotation);
      }
      setPosition(newPos);
    }
  });

  // Handle Placement Trigger
  useEffect(() => {
    const triggerPlace = () => {
      if (meshRef.current) {
        const quat = new THREE.Quaternion().setFromEuler(targetRotation);
        const standardEuler = new THREE.Euler().setFromQuaternion(quat, 'XYZ');
        onPlace(position, standardEuler);
      }
    };

    if (dragMode) {
      // For Drag Mode (Moving existing cards), we still place on mouse up
      const handleUp = () => triggerPlace();
      window.addEventListener('pointerup', handleUp);
      return () => window.removeEventListener('pointerup', handleUp);
    } else {
      // For Quick Mode (New cards), place on click BUT check distance
      const handleClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).tagName !== 'CANVAS') return;
        
        // Calculate distance from mousedown to mouseup (click)
        if (clickStartRef.current) {
          const dx = e.clientX - clickStartRef.current.x;
          const dy = e.clientY - clickStartRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If moved more than 5 pixels, assume camera orbit, do not place
          if (distance > 5) return; 
        }

        triggerPlace();
      };
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [position, targetRotation, onPlace, dragMode]);

  return (
    <mesh ref={meshRef} name="ghost">
      <boxGeometry args={[CARD_WIDTH, CARD_THICKNESS, CARD_HEIGHT]} />
      <meshBasicMaterial 
        color={dragMode ? 0x3b82f6 : (isFreezeMode ? 0x00ffff : 0x00ff00)} 
        opacity={0.5} 
        transparent 
        wireframe 
      />
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0,0,0), 1.5, dragMode ? 0x3b82f6 : (isFreezeMode ? 0x00ffff : 0xffff00)]} />
    </mesh>
  );
};

// Precision Mode component (Blender-like)
const PrecisionGhost = ({
  isFreezeMode,
  onPlace
}: {
  isFreezeMode: boolean;
  onPlace: (pos: THREE.Vector3, rot: THREE.Euler) => void;
}) => {
  const [target, setTarget] = useState<THREE.Object3D | null>(null);
  const [mode, setMode] = useState<'translate' | 'rotate'>('translate');
  const targetRef = useRef<THREE.Object3D | null>(null);
  useEffect(() => { targetRef.current = target; }, [target]);
  const initialPos = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch(e.key.toLowerCase()) {
        case 't': setMode('translate'); break;
        case 'r': setMode('rotate'); break;
        case 'enter':
          if (targetRef.current) {
             onPlace(targetRef.current.position.clone(), targetRef.current.rotation.clone());
          }
          break;
      }
    };
    const handleCustomEvent = () => {
         if (targetRef.current) {
             onPlace(targetRef.current.position.clone(), targetRef.current.rotation.clone());
          }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-precision-place', handleCustomEvent);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('trigger-precision-place', handleCustomEvent);
    };
  }, [onPlace]);

  return (
    <>
      {target && (
        <TransformControls 
            object={target} 
            mode={mode} 
            translationSnap={0.1} 
            rotationSnap={THREE.MathUtils.degToRad(5)} 
            space="local"
        />
      )}
      <mesh 
        ref={setTarget} 
        position={initialPos} 
        name="precision-ghost"
      >
        <boxGeometry args={[CARD_WIDTH, CARD_THICKNESS, CARD_HEIGHT]} />
        <meshStandardMaterial 
            color={isFreezeMode ? "#22d3ee" : "#fbbf24"} 
            opacity={0.8} 
            transparent 
            emissive={isFreezeMode ? "#22d3ee" : "#fbbf24"}
            emissiveIntensity={0.5}
        />
        <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(CARD_WIDTH, CARD_THICKNESS, CARD_HEIGHT)]} />
            <lineBasicMaterial color="white" />
        </lineSegments>
      </mesh>
    </>
  );
};

const PhysicsWorld: React.FC<PhysicsWorldProps> = ({ 
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
  
  // Use prop state instead of local state
  const draggingCardData = useMemo(() => cards.find(c => c.id === draggingCardId) || null, [cards, draggingCardId]);

  // Handle creating new card
  const handlePlaceNew = (pos: THREE.Vector3, rot: THREE.Euler) => {
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
    const suits = ['spades', 'hearts', 'clubs', 'diamonds'] as const;
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    
    addCard({
      id: Math.random().toString(36).substr(2, 9),
      position: [pos.x, pos.y, pos.z],
      rotation: [rot.x, rot.y, rot.z],
      suit: randomSuit,
      color: (randomSuit === 'hearts' || randomSuit === 'diamonds') ? 'red' : 'black',
      rank: randomRank,
      locked: isFreezeMode
    });
  };

  // Handle placing the Dragged Card
  const handlePlaceMoved = (pos: THREE.Vector3, rot: THREE.Euler) => {
    if (draggingCardData) {
      updateCard(draggingCardData.id, [pos.x, pos.y, pos.z], [rot.x, rot.y, rot.z]);
      setDraggingCardId(null);
    }
  };

  // Triggered when user holds mouse down on a card in MOVE mode
  const onCardDragStart = (card: CardData) => {
    setDraggingCardId(card.id);
  };

  // Determine which Ghost to show
  const showNewCardGhost = pointerMode === PointerMode.PLACE;
  const showMoveCardGhost = pointerMode === PointerMode.MOVE && !!draggingCardData;

  return (
    <Physics gravity={[0, -9.81, 0]} iterations={20} tolerance={0.0001}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      
      <Floor />
      
      {cards.map((card) => {
        // Hide the card if it is currently being dragged
        const isDragging = draggingCardData?.id === card.id;
        
        return (
          <Card 
            key={card.id} 
            data={card} 
            pointerMode={pointerMode}
            onRemove={() => removeCard(card.id)}
            onDragStart={() => onCardDragStart(card)}
            isDragging={isDragging}
          />
        );
      })}

      {/* GHOST FOR NEW CARDS */}
      {showNewCardGhost && (
        interactionMode === InteractionMode.QUICK ? (
          <GhostCard 
              rotationMode={rotationMode} 
              isFreezeMode={isFreezeMode}
              onPlace={handlePlaceNew} 
          />
        ) : (
          <PrecisionGhost 
              isFreezeMode={isFreezeMode}
              onPlace={handlePlaceNew}
          />
        )
      )}

      {/* GHOST FOR MOVING EXISTING CARDS (Drag Drop) */}
      {showMoveCardGhost && (
        <GhostCard 
            rotationMode={rotationMode} // User can still rotate while moving!
            isFreezeMode={isFreezeMode}
            onPlace={handlePlaceMoved}
            dragMode={true} // Triggers on mouse up
        />
      )}
      
    </Physics>
  );
};

export default PhysicsWorld;
