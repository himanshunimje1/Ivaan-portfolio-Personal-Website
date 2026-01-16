import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const milestones = [
  { id: 'birth', icon: '🍼', label: 'Birth', index: 0 },
  { id: 'walk', icon: '👣', label: 'First Walk', index: 4 },
  { id: 'birthday', icon: '🎂', label: '1st Birthday', index: 8 },
  { id: 'school', icon: '🎒', label: 'School', index: 12 },
];

const Fireflies = () => {
  const [flies] = useState(() => Array.from({ length: 20 }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flies.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: 0 
          }}
          animate={{
            x: [null, Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [null, Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            opacity: [0, 0.4, 0.2, 0.6, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-yellow-200 rounded-full blur-[1px] shadow-[0_0_8px_rgba(253,224,71,0.8)]"
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

  useEffect(() => {
    let lastScrollTime = 0;
    const handleWheel = (e) => {
      const now = Date.now();
      if (now - lastScrollTime < 400) return;
      if (Math.abs(e.deltaY) > 20) {
        if (e.deltaY > 0) paginate(1);
        else paginate(-1);
        lastScrollTime = now;
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, photos.length]);

  if (photos.length === 0) return (
    <div className="h-screen w-screen bg-[#0a0c10] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  const currentPhoto = photos[currentIndex];

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#0a0c10] via-[#1a1f2e] to-[#0a0c10] text-white overflow-hidden flex flex-col font-sans select-none relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      <Fireflies />

      {/* Ghibli Sky Header */}
      <div className="absolute top-0 w-full z-30 p-6 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl px-8 py-2 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <div className="text-[12px] font-bold tracking-[0.4em] uppercase text-emerald-300/80">Ivaan's Journey</div>
        </motion.div>
      </div>

      {/* Main Photo Viewer */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-24">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction < 0 ? '100%' : '-100%', opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="absolute max-w-full max-h-full flex items-center justify-center p-4"
          >
            <div className="relative group">
              {/* Magic Border Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
              <img
                src={currentPhoto.url}
                className="relative max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/10"
                alt=""
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Milestone Navigation Buttons (Instead of plain circles) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 z-20 pointer-events-none">
          <motion.button 
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}
            disabled={currentIndex === 0}
            className={`pointer-events-auto p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-lg transition-all ${currentIndex === 0 ? 'opacity-0' : 'opacity-100 text-emerald-400'}`}
          >
            <span className="text-2xl">🍃</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}
            disabled={currentIndex === photos.length - 1}
            className={`pointer-events-auto p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-lg transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'opacity-100 text-emerald-400'}`}
          >
            <span className="text-2xl">✨</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Growth Path & Controls */}
      <div className="bg-gradient-to-t from-[#05070a] to-transparent pt-12 pb-10 px-6 flex flex-col gap-10 z-30 w-full">
        
        {/* Growth Path (Milestones) */}
        <div className="w-full max-w-3xl mx-auto flex justify-between items-center relative px-4">
          <div className="absolute h-0.5 inset-x-8 bg-white/5 top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500/40"
              animate={{ width: `${(currentIndex / (photos.length - 1)) * 100}%` }}
            />
          </div>
          {milestones.map((milestone) => (
            <motion.button
              key={milestone.id}
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setDirection(milestone.index > currentIndex ? 1 : -1);
                setCurrentIndex(milestone.index);
              }}
              className={`relative z-10 p-3 rounded-2xl transition-all duration-500 flex flex-col items-center gap-2 ${
                currentIndex >= milestone.index ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-[#1a1f2e] grayscale opacity-40'
              }`}
            >
              <span className="text-xl">{milestone.icon}</span>
              <span className={`text-[8px] absolute -bottom-6 font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
                currentIndex >= milestone.index ? 'text-emerald-400' : 'text-white/20'
              }`}>
                {milestone.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Dynamic Scrubber */}
        <div className="w-full max-w-2xl mx-auto px-4 relative mt-4">
          <input
            type="range"
            min="0"
            max={photos.length - 1}
            value={currentIndex}
            onChange={handleScrub}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => setIsScrubbing(false)}
            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer ghibli-scrubber"
          />
        </div>

        {/* Thumbnail Scroll */}
        <div 
          ref={thumbnailRef}
          className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-10 scroll-smooth w-full"
        >
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 shadow-xl ${
                i === currentIndex 
                  ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-black scale-110' 
                  : 'opacity-20 hover:opacity-100 grayscale hover:grayscale-0'
              }`}
            >
              <img src={photo.url} className="w-full h-full object-cover" alt="" />
            </motion.div>
          ))}
        </div>

        {/* Minimal Audio Control */}
        <div className="flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
            className={`px-8 py-3 rounded-full border border-white/10 backdrop-blur-2xl flex items-center gap-4 transition-all ${
              isPlaying ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5'
            }`}
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isPlaying ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse' : 'bg-white/10'}`} />
            <span className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors ${isPlaying ? 'text-white' : 'text-white/20'}`}>
              Nature Ambient {isPlaying ? 'On' : 'Off'}
            </span>
          </motion.button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .ghibli-scrubber::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #34d399;
          border: 4px solid #05070a;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(52,211,153,0.5);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .ghibli-scrubber::-webkit-slider-thumb:hover {
          transform: scale(1.4);
        }
      `}} />
    </div>
  );
}
