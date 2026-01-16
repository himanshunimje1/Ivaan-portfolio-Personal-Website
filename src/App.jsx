import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const milestones = [
  { id: 'birth', icon: '✨', label: 'Magic Begins', index: 0 },
  { id: 'walk', icon: '👣', label: 'First Steps', index: 4 },
  { id: 'birthday', icon: '🎂', label: 'Golden Year', index: 8 },
  { id: 'school', icon: '🎒', label: 'New World', index: 12 },
];

const UniverseBackground = () => {
  const images = [
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2000&auto=format&fit=crop", // Galaxy
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop", // Nebula
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2000&auto=format&fit=crop", // Earth/Space
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2000&auto=format&fit=crop", // Stars
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: 0.5, 
            scale: 1,
            rotate: [0, 1, -1, 0],
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ 
            opacity: { duration: 2.5 },
            scale: { duration: 10, ease: "linear" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={images[index]} 
            className="w-full h-full object-cover" 
            alt="Universe" 
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
};

const Fireflies = () => {
  const [flies] = useState(() => Array.from({ length: 25 }));
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {flies.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0 
          }}
          animate={{
            x: [null, Math.random() * 100 + "%", Math.random() * 100 + "%"],
            y: [null, Math.random() * 100 + "%", Math.random() * 100 + "%"],
            opacity: [0, 0.7, 0.3, 0.8, 0],
            scale: [0, 1.2, 0.8, 1, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full blur-[1px] shadow-[0_0_10px_#fff]"
        />
      ))}
    </div>
  );
};

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const audioRef = useRef(null);
  const thumbnailRef = useRef(null);

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
    return () => window.removeEventListener('click', play);
  }, []);

  useEffect(() => {
    if (thumbnailRef.current && !isScrubbing) {
      const activeThumb = thumbnailRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex, isScrubbing]);

  const paginate = (newDirection) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < photos.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') paginate(1);
      else if (e.key === 'ArrowLeft') paginate(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length]);

  const handleScrub = (e) => {
    const newIndex = parseInt(e.target.value);
    if (newIndex !== currentIndex) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentIndex(newIndex);
    }
  };

  if (photos.length === 0) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-white tracking-[2em] uppercase text-xs">Entering Space...</motion.div>
    </div>
  );

  const currentPhoto = photos[currentIndex];

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col font-sans select-none relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      <UniverseBackground />
      <Fireflies />

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex flex-col h-full">
        
        {/* Top Title */}
        <div className="pt-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[1.5em] uppercase text-white/40 ml-[1.5em]"
          >
            Ivaan Portfolio
          </motion.h1>
        </div>

        {/* 75% MAIN PHOTO FRAME */}
        <div className="flex-1 flex items-center justify-center overflow-hidden px-4 py-4 relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, scale: 0.8, x: direction * 100, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.2, x: -direction * 100, filter: "blur(20px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-full h-full flex items-center justify-center p-4"
            >
              <div className="relative w-full h-full max-w-6xl flex items-center justify-center group">
                <div className="absolute -inset-10 bg-white/5 rounded-full blur-[100px] opacity-20" />
                <img
                  src={currentPhoto.url}
                  className="relative max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
                  alt=""
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Magical Navigation Buttons */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-10 z-30 pointer-events-none">
            <motion.button 
              whileHover={{ scale: 1.2, x: -10 }}
              onClick={() => paginate(-1)}
              className={`pointer-events-auto p-6 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
            >
              <span className="text-3xl drop-shadow-[0_0_10px_white]">✨</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.2, x: 10 }}
              onClick={() => paginate(1)}
              className={`pointer-events-auto p-6 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'opacity-100'}`}
            >
              <span className="text-3xl drop-shadow-[0_0_10px_white]">✨</span>
            </motion.button>
          </div>
        </div>

        {/* 25% BOTTOM SECTION */}
        <div className="relative z-30 w-full flex flex-col gap-6 pb-10 pt-2 bg-gradient-to-t from-black via-black/60 to-transparent">
          
          {/* 1. Thumbnail Strip */}
          <div 
            ref={thumbnailRef}
            className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-20 scroll-smooth w-full items-center h-24"
          >
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                whileHover={{ scale: 1.1, y: -10 }}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={`flex-shrink-0 h-16 w-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 shadow-2xl ${
                  i === currentIndex 
                    ? 'ring-4 ring-white ring-offset-4 ring-offset-black scale-125 z-10' 
                    : 'opacity-20 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <img src={photo.url} className="w-full h-full object-cover" alt="" />
              </motion.div>
            ))}
          </div>

          {/* 2. Scrubber Slider */}
          <div className="w-full max-w-4xl mx-auto px-12 relative h-10 flex items-center">
            <div className="absolute inset-x-12 h-[1px] bg-white/10 rounded-full" />
            <input
              type="range"
              min="0"
              max={photos.length - 1}
              value={currentIndex}
              onChange={handleScrub}
              onMouseDown={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
              className="w-full h-full bg-transparent appearance-none cursor-pointer z-10 universe-slider"
            />
          </div>

          {/* 3. ORIGINAL MILESTONE ICONS (Restored) */}
          <div className="w-full max-w-2xl mx-auto flex justify-between items-center relative px-8 py-2">
            {milestones.map((milestone) => (
              <motion.button
                key={milestone.id}
                whileHover={{ scale: 1.2, y: -5 }}
                onClick={() => {
                  setDirection(milestone.index > currentIndex ? 1 : -1);
                  setCurrentIndex(milestone.index);
                }}
                className={`flex flex-col items-center gap-3 transition-all duration-1000 ${
                  currentIndex >= milestone.index ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <div className={`p-4 rounded-full border transition-all duration-700 ${
                  currentIndex >= milestone.index 
                    ? 'bg-white/20 border-white shadow-[0_0_20px_white]' 
                    : 'border-white/10'
                }`}>
                  <span className="text-2xl">{milestone.icon}</span>
                </div>
                <span className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${
                  currentIndex >= milestone.index ? 'text-white shadow-glow' : 'text-white/20'
                }`}>
                  {milestone.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Audio Control */}
          <div className="absolute bottom-4 left-6 opacity-30 hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                  setIsPlaying(!isPlaying);
                }
              }}
              className="flex items-center gap-3"
            >
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-400 animate-ping' : 'bg-white/20'}`} />
              <span className="text-[8px] font-bold tracking-widest uppercase">Audio</span>
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .shadow-glow { text-shadow: 0 0 15px rgba(255,255,255,0.8); }

        .universe-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 20px white;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .universe-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
      `}} />
    </div>
  );
}
