
import React, { useMemo, useEffect, useState } from 'react';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { CardData, PointerMode } from '../types';

interface CardProps {
  data: CardData;
  pointerMode?: PointerMode;
  onRemove?: () => void;
  onDragStart?: () => void;
  isDragging?: boolean;
}

const CARD_WIDTH = 2.0;
const CARD_HEIGHT = 2.8;
const CARD_THICKNESS = 0.02;

const Card: React.FC<CardProps> = ({ 
  data, 
  pointerMode = PointerMode.PLACE, 
  onRemove,
  onDragStart,
  isDragging = false
}) => {
  // If dragging, we temporarily remove from physics/visual scene effectively
  // But we can't unmount component entirely or hook ordering changes.
  // Instead we sleep physics and hide mesh.

  const [ref, api] = useBox(() => ({
    mass: 0.1, // Always init as dynamic so we can sleep/wake it
    type: 'Dynamic',
    position: data.position,
    rotation: data.rotation,
    args: [CARD_WIDTH, CARD_THICKNESS, CARD_HEIGHT],
    linearDamping: 0.5, 
    angularDamping: 0.5, 
    material: {
      friction: 0.9, 
      restitution: 0.0, 
    }
  }));

  // Effect 1: Handle Position Teleporting (Sync React State -> Physics World)
  // Only runs when dragging status changes or the defined position VALUES change (Placement/Move)
  // We decompose dependencies to avoid re-running when just 'locked' changes (which preserves physics settling)
  useEffect(() => {
    if (isDragging) {
      // Hide and disable physics while dragging (Ghost takes over)
      api.mass.set(0);
      api.velocity.set(0, 0, 0);
      api.position.set(0, -100, 0); 
      api.sleep();
    } else {
      // Teleport to the new position defined by React state
      api.position.set(data.position[0], data.position[1], data.position[2]);
      api.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
      
      // CRITICAL: Reset velocity to prevent "flinging" after a teleport
      // This ensures the card sits still immediately after being dropped
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      
      // If it's not locked, make sure it has mass and is awake
      if (!data.locked) {
        api.mass.set(0.1);
        api.wakeUp();
      }
    }
  }, [
    isDragging, 
    api, 
    // Decompose position/rotation to ensure check is on values, not object reference
    data.position[0], data.position[1], data.position[2], 
    data.rotation[0], data.rotation[1], data.rotation[2]
  ]);

  // Effect 2: Handle Locking/Freezing (State Sync)
  // Only runs when locked state changes
  useEffect(() => {
    if (isDragging) return; // Ignore if dragging (handled above)

    if (data.locked) {
      // Freeze: Make static, stop moving
      api.mass.set(0);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
    } else {
      // Unfreeze: Make dynamic, wake up
      api.mass.set(0.1);
      api.wakeUp();
      // Tiny nudge to ensure physics engine activates it
      api.velocity.set(0, 0.01, 0); 
    }
  }, [data.locked, isDragging, api]);

  // Texture Gen
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 358;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = data.color === 'red' ? '#aa0000' : '#000000';
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = data.color === 'red' ? '#ff0000' : '#000000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 100px Arial';
      ctx.fillText(data.rank, canvas.width / 2, canvas.height / 2);
      ctx.font = 'bold 32px Arial';
      ctx.fillText(data.rank, 30, 50);
      ctx.fillText(data.rank, canvas.width - 30, canvas.height - 50);
    }
    return new THREE.CanvasTexture(canvas);
  }, [data.color, data.rank]);

  // Hover state
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = (e: any) => {
    e.stopPropagation(); // Only highlight top card
    if (pointerMode !== PointerMode.PLACE) {
      setHovered(true);
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (pointerMode === PointerMode.DELETE && onRemove) {
      onRemove();
    }
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (pointerMode === PointerMode.MOVE && onDragStart) {
      // Capture pointer? R3F handles this mostly, but logic is in PhysicsWorld
      onDragStart();
    }
  };

  // Determine highlight color
  let emissiveColor = 'black';
  let emissiveIntensity = 0;
  
  if (hovered && !isDragging) {
    if (pointerMode === PointerMode.DELETE) {
      emissiveColor = '#ef4444'; // Red
      emissiveIntensity = 0.6;
    } else if (pointerMode === PointerMode.MOVE) {
      emissiveColor = '#3b82f6'; // Blue
      emissiveIntensity = 0.6;
    }
  }

  return (
    <mesh 
      ref={ref as any} 
      castShadow 
      receiveShadow
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      visible={!isDragging}
    >
      <boxGeometry args={[CARD_WIDTH, CARD_THICKNESS, CARD_HEIGHT]} />
      <meshStandardMaterial map={texture} attach="material-2" emissive={emissiveColor} emissiveIntensity={emissiveIntensity} /> 
      <meshStandardMaterial color="#2563eb" attach="material-3" emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      <meshStandardMaterial color="#f0f0f0" attach="material-0" emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      <meshStandardMaterial color="#f0f0f0" attach="material-1" emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      <meshStandardMaterial color="#f0f0f0" attach="material-4" emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      <meshStandardMaterial color="#f0f0f0" attach="material-5" emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
    </mesh>
  );
};

export default Card;
