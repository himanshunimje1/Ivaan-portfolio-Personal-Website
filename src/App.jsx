import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useTexture, 
  ScrollControls, 
  Scroll, 
  useScroll, 
} from '@react-three/drei';
import * as THREE from 'three';

function PhotoFrame({ url, index, total }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const scroll = useScroll();
  const { viewport } = useThree();

  // Calculate the appropriate aspect ratio to avoid stretching
  const imageAspect = texture.image.width / texture.image.height;
  const viewportAspect = viewport.width / viewport.height;
  
  let width, height;
  if (imageAspect > viewportAspect) {
    width = viewport.width * 0.85;
    height = width / imageAspect;
  } else {
    height = viewport.height * 0.85;
    width = height * imageAspect;
  }

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Normalize scroll progress (0 to total-1)
    const scrollProgress = scroll.offset * (total - 1);
    const distance = scrollProgress - index;
    
    // POSITION: Space them out by exactly one viewport width
    // This ensures only the current and next/prev are visible during transition
    const targetX = -distance * viewport.width;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    
    // OPACITY: Only show the two photos involved in the current transition
    const opacity = Math.max(0, 1 - Math.abs(distance));
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, opacity, 0.15);
    meshRef.current.material.transparent = true;
    
    // Subtle scale for depth
    const scale = 0.95 + opacity * 0.05;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={0} />
    </mesh>
  );
}

function Scene({ photos }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      
      <ScrollControls pages={photos.length} damping={0.4} horizontal>
        <Scroll>
          {photos.map((photo, i) => (
            <Suspense key={photo.url} fallback={null}>
              <PhotoFrame url={photo.url} index={i} total={photos.length} />
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

  if (photos.length === 0) return null;

  return (
    <div className="h-screen w-screen bg-black relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Scene photos={photos} />
      </Canvas>

      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="text-white/10 text-[10px] uppercase tracking-[3em] animate-pulse">Ivaan Portfolio</div>
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
