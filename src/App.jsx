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
  { id: 6, url: '/diary/17C0D3CC-FE7D-40A7-938E-BE5C402A1696.jpg' },
  { id: 7, url: '/diary/IMG_7070.JPG' },
  { id: 8, url: '/diary/IMG_7071.JPG' },
];

function CarouselFrame({ url, index, total }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const scrollOffset = scroll.offset; // 0 to 1
    
    // Each photo takes up a slot in the scroll
    const personalOffset = index / total;
    let distance = scrollOffset - personalOffset;
    
    // Circular logic for the carousel feel
    if (distance > 0.5) distance -= 1;
    if (distance < -0.5) distance += 1;

    // Radius of the carousel circle
    const radius = viewport.width * 1.5;
    
    // Angle in radians based on scroll position
    const angle = distance * Math.PI * 2;
    
    // Position on a circle (Clockwise / Anti-clockwise behavior)
    const targetX = Math.sin(angle) * radius;
    const targetZ = Math.cos(angle) * radius - radius; // Pull back so the center one is at z=0

    // Smooth transition
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
    
    // Rotation to face the center
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle, 0.1);

    // Scale logic: 70% of viewport width when in focus
    const focus = 1 - Math.min(Math.abs(distance) * 4, 1);
    const targetScale = 0.5 + focus * 0.5; // Scale from 50% to 100% relative to our base size
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
  });

  return (
    <group ref={meshRef}>
      {/* Glass Backplate */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[viewport.width * 0.7, viewport.height * 0.8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.05} 
          roughness={0.1} 
          metalness={0.9}
        />
      </mesh>

      {/* The Photo (70% width) */}
      <mesh>
        <planeGeometry args={[viewport.width * 0.7, viewport.height * 0.8]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>

      {/* Frame Border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[viewport.width * 0.702, viewport.height * 0.802]} />
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
      
      {/* We use ScrollControls to drive the carousel rotation */}
      <ScrollControls pages={photos.length} damping={0.3}>
        <Scroll>
          {photos.map((photo, i) => (
            <Suspense key={photo.id + i} fallback={null}>
              <CarouselFrame 
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
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Scene />
      </Canvas>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-white/10 text-[10px] uppercase tracking-[2.5em] animate-pulse">
            Rotate the Gallery
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
          className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl flex items-center justify-center transition-all hover:bg-white/10"
        >
          <div className={`w-2 h-2 rounded-full transition-all duration-700 ${isPlaying ? 'bg-blue-400 shadow-[0_0_15px_cyan]' : 'bg-white/20'}`} />
        </button>
      </div>
    </div>
  );
}
