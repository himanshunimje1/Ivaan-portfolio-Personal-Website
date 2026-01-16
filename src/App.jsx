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

function GlassFrame({ url, index, total }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const scrollOffset = scroll.offset;
    const personalOffset = index / total;
    const distance = Math.abs(scrollOffset - personalOffset);
    
    // Focus logic: 0 when centered, 1 when far away
    const focus = 1 - Math.min(distance * 3, 1);
    
    // Position sideways: Center the active one
    const xBase = (index - scrollOffset * total) * (viewport.width * 1.1);
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, xBase, 0.1);
    
    // ZOOM EFFECT:
    // Scale the entire mesh (the "frame")
    const frameScale = 0.8 + focus * 0.2; // From 80% to 100% of viewport size
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, frameScale, 0.1));
    
    // SUBTLE MOTION ZOOM:
    // We can also animate the texture scale for a "Ken Burns" effect
    const time = state.clock.getElapsedTime();
    const pulse = Math.sin(time * 0.5) * 0.05;
    meshRef.current.children[1].scale.setScalar(1 + pulse + focus * 0.1);
  });

  return (
    <group ref={meshRef}>
      {/* Glass Backplate (Apple style) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[viewport.width * 0.95, viewport.height * 0.95]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.05} 
          roughness={0.1} 
          metalness={0.9}
        />
      </mesh>

      {/* The Photo (Zoomable child) */}
      <mesh>
        <planeGeometry args={[viewport.width * 0.95, viewport.height * 0.95]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>

      {/* Thin Light Border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[viewport.width * 0.952, viewport.height * 0.952]} />
        <meshBasicMaterial color="white" transparent opacity={0.05} wireframe />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={3} />
      
      <ScrollControls pages={photos.length} damping={0.3} horizontal>
        <Scroll>
          {photos.map((photo, i) => (
            <Suspense key={photo.id} fallback={null}>
              <GlassFrame 
                url={photo.url} 
                index={i} 
                total={photos.length} 
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
    window.addEventListener('wheel', play, { once: true });
    return () => {
      window.removeEventListener('click', play);
      window.removeEventListener('scroll', play);
      window.removeEventListener('wheel', play);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
        <Scene />
      </Canvas>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-white/10 text-[10px] uppercase tracking-[2.5em] animate-pulse">
            Explore the Story
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
          className="w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center transition-all hover:bg-white/10"
        >
          <div className={`w-2 h-2 rounded-full transition-all duration-700 ${isPlaying ? 'bg-blue-400 shadow-[0_0_15px_cyan]' : 'bg-white/20'}`} />
        </button>
      </div>
    </div>
  );
}
