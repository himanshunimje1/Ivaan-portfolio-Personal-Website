import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useTexture, 
  ScrollControls, 
  Scroll, 
  useScroll, 
} from '@react-three/drei';
import * as THREE from 'three';

const photos = [
  { id: 1, url: '/diary/17C0D3CC-FE7D-40A7-938E-BE5C402A1696.jpg' },
  { id: 2, url: '/diary/IMG_7070.JPG' },
  { id: 3, url: '/diary/IMG_7071.JPG' },
  { id: 4, url: '/diary/IMG_7072.JPG' },
  { id: 5, url: '/diary/IMG_8667.jpg' },
];

function GlassFrame({ url, index, total, randomPos }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const scrollOffset = scroll.offset;
    const personalOffset = index / total;
    const distance = Math.abs(scrollOffset - personalOffset);
    
    // Focus logic: Active one grows and comes forward
    const focus = 1 - Math.min(distance * 3, 1);
    const scaleTarget = 0.5 + focus * 2.5;
    const zTarget = randomPos.z + focus * 8;

    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scaleTarget, 0.1));
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, zTarget, 0.1);
    
    // Floating movement
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = randomPos.y + Math.sin(time * 0.5 + index) * 0.2;
  });

  return (
    <group position={[randomPos.x, randomPos.y, randomPos.z]} ref={meshRef}>
      {/* Glass Backplate */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[3.2, 4.2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.1} 
          roughness={0} 
          metalness={1}
        />
      </mesh>

      {/* The Photo */}
      <mesh>
        <planeGeometry args={[3, 4]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Scene() {
  const { viewport } = useThree();
  
  const frames = useMemo(() => photos.map((p, i) => ({
    ...p,
    pos: {
      x: (Math.random() - 0.5) * 15,
      y: (Math.random() - 0.5) * 10,
      z: -Math.random() * 20
    }
  })), []);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={5} />
      
      <ScrollControls pages={5} damping={0.2}>
        <Scroll>
          {frames.map((frame, i) => (
            <Suspense key={frame.id} fallback={null}>
              <GlassFrame 
                {...frame} 
                index={i} 
                total={frames.length} 
                randomPos={frame.pos} 
              />
            </Suspense>
          ))}
        </Scroll>
      </ScrollControls>
    </>
  );
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const play = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    window.addEventListener('click', play, { once: true });
    window.addEventListener('scroll', play, { once: true });
    return () => {
      window.removeEventListener('click', play);
      window.removeEventListener('scroll', play);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      
      <Canvas camera={{ position: [0, 0, 15], fov: 40 }}>
        <Scene />
      </Canvas>

      {/* Manual Start Hint */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/10 text-[10px] uppercase tracking-[2em] animate-pulse">
            Click or Scroll to Start
          </div>
        </div>
      )}

      {/* Audio Button */}
      <div className="absolute bottom-10 right-10 z-20">
        <button 
          onClick={() => {
            if (audioRef.current) {
              if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
              setIsPlaying(!isPlaying);
            }
          }}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-blue-400 shadow-[0_0_10px_cyan]' : 'bg-white/20'}`} />
        </button>
      </div>
    </div>
  );
}
