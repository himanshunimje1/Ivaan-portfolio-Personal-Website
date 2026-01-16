import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useTexture, 
  ScrollControls, 
  Scroll, 
  useScroll, 
  Preload,
} from '@react-three/drei';
import * as THREE from 'three';

function PhotoFrame({ url, index, total }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const { viewport } = useThree();

  // Calculate the appropriate aspect ratio to avoid stretching
  const imageAspect = texture.image ? (texture.image.width / texture.image.height) : 1;
  const viewportAspect = viewport.width / viewport.height;
  
  let width, height;
  if (imageAspect > viewportAspect) {
    width = viewport.width * 0.9;
    height = width / imageAspect;
  } else {
    height = viewport.height * 0.9;
    width = height * imageAspect;
  }

  useScroll(); // We need to access scroll inside useFrame via the hook
  const scroll = useScroll();

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Normalize scroll progress (0 to total-1)
    // We use a slightly different multiplier to ensure we can reach the end
    const scrollProgress = scroll.offset * (total - 1);
    const distance = scrollProgress - index;
    
    // POSITION: Space them out by exactly one viewport width
    const targetX = -distance * viewport.width;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    
    // OPACITY: Sharp transition
    // distance is 0 when fully active, 1 when neighbor is active
    const opacity = Math.max(0, 1 - Math.abs(distance) * 1.5);
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, opacity, 0.2);
    meshRef.current.material.transparent = true;
    
    // SCALE: Zoom effect as it becomes active
    const scale = 0.9 + (opacity * 0.1);
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
      
      {/* Increased pages to make scrolling feel more deliberate */}
      <ScrollControls pages={photos.length} damping={0.3} horizontal>
        <Scroll>
          {photos.map((photo, i) => (
            <Suspense key={photo.url} fallback={null}>
              <PhotoFrame url={photo.url} index={i} total={photos.length} />
            </Suspense>
          ))}
        </Scroll>
        <Preload all />
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
      .then(data => {
        // Sort or filter if needed, but for now just use as is
        setPhotos(data);
      })
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

  if (photos.length === 0) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center text-white/20 uppercase tracking-[2em] animate-pulse">
      Loading...
    </div>
  );

  return (
    <div className="h-screen w-screen bg-black relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Scene photos={photos} />
      </Canvas>

      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center px-4">
          <div className="text-white/20 text-[10px] uppercase tracking-[3em] animate-pulse">Ivaan Portfolio</div>
          <div className="mt-8 text-white/5 text-[8px] uppercase tracking-[1em]">Scroll to navigate</div>
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
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-10 text-white/10 text-[8px] uppercase tracking-widest font-light pointer-events-none">
        01 / {String(photos.length).padStart(2, '0')}
      </div>
    </div>
  );
}
