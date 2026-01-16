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

  // Calculate the appropriate aspect ratio for the frame to avoid stretching
  const imageAspect = texture.image.width / texture.image.height;
  const viewportAspect = viewport.width / viewport.height;
  
  // Base dimensions - we want the photo to fit nicely in the screen
  let width, height;
  if (imageAspect > viewportAspect) {
    // Landscape photo
    width = viewport.width * 0.8;
    height = width / imageAspect;
  } else {
    // Portrait photo
    height = viewport.height * 0.8;
    width = height * imageAspect;
  }

  useFrame(() => {
    if (!meshRef.current) return;
    const scrollOffset = scroll.offset;
    const personalOffset = index / total;
    const distance = scrollOffset - personalOffset;
    
    // Smooth horizontal transition
    // One picture at a time: current photo is at x=0
    const targetX = -distance * viewport.width * 1.2;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    
    // Opacity logic: only show the main one clearly
    const opacity = Math.max(0, 1 - Math.abs(distance) * 5);
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, opacity, 0.1);
    meshRef.current.material.transparent = true;
    
    // Subtle scale: slightly smaller when not active
    const scale = 0.9 + opacity * 0.1;
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="text-white/20 text-[10px] uppercase tracking-[3em] animate-pulse">Ivaan Portfolio</div>
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
