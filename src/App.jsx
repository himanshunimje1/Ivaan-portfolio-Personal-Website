import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useTexture, 
  ScrollControls, 
  Scroll, 
  useScroll, 
} from '@react-three/drei';
import * as THREE from 'three';

function CarouselFrame({ url, index, total }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const scroll = useScroll();
  const { viewport } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const scrollOffset = scroll.offset;
    const personalOffset = index / total;
    let distance = scrollOffset - personalOffset;
    
    if (distance > 0.5) distance -= 1;
    if (distance < -0.5) distance += 1;

    const radius = viewport.width * 0.8; 
    const angle = distance * Math.PI * 2;
    
    const targetX = Math.sin(angle) * radius;
    const targetZ = Math.cos(angle) * radius - radius; 

    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle, 0.1);

    const visibility = Math.max(0, 1 - Math.abs(distance) * 5);
    
    meshRef.current.children.forEach(child => {
      if (child.material) {
        child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, visibility, 0.1);
        child.material.transparent = true;
      }
    });

    const focus = 1 - Math.min(Math.abs(distance) * 4, 1);
    const targetScale = 0.7 + focus * 0.3; 
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[viewport.width * 0.7, viewport.height * 0.8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.05} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh>
        <planeGeometry args={[viewport.width * 0.7, viewport.height * 0.8]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[viewport.width * 0.702, viewport.height * 0.802]} />
        <meshBasicMaterial color="white" transparent opacity={0.05} wireframe />
      </mesh>
    </group>
  );
}

function Scene({ photos }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={5} />
      
      <ScrollControls pages={photos.length} damping={0.4}>
        <Scroll>
          {photos.map((photo, i) => (
            <Suspense key={photo.url} fallback={null}>
              <CarouselFrame url={photo.url} index={i} total={photos.length} />
            </Suspense>
          ))}
        </Scroll>
      </ScrollControls>
    </>
  );
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch the dynamic manifest
    fetch('/diary/manifest.json')
      .then(res => res.json())
      .then(data => setPhotos(data))
      .catch(err => console.error('Error loading manifest:', err));

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

  if (photos.length === 0) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-[2em] animate-pulse">Loading...</div>;

  return (
    <div className="h-screen w-screen bg-black relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
        <Scene photos={photos} />
      </Canvas>

      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="text-white/20 text-[10px] uppercase tracking-[3em] animate-pulse">Explore</div>
        </div>
      )}

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
