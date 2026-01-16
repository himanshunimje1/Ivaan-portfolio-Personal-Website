import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const milestones = [
  { id: 'birth', icon: '✨', label: 'Magic Begins', index: 0 },
  { id: 'walk', icon: '👣', label: 'First Steps', index: 4 },
  { id: 'birthday', icon: '🎂', label: 'Golden Year', index: 8 },
  { id: 'school', icon: '🎒', label: 'New World', index: 12 },
];

const Sparkles = () => {
  const [particles] = useState(() => Array.from({ length: 40 }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
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
            opacity: [0, 0.8, 0.4, 1, 0],
            scale: [0, 1.5, 0.5, 1.2, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 5 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 bg-yellow-100 rounded-full blur-[0.5px] shadow-[0_0_10px_#fff,0_0_20px_#ffd700]"
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
    <div className="h-screen w-screen bg-[#02040a] flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-yellow-200 text-xl tracking-[1em] font-serif uppercase"
      >
        Magic Loading...
      </motion.div>
    </div>
  );

  const currentPhoto = photos[currentIndex];

  return (
    <div className="h-screen w-screen bg-[#02040a] text-white overflow-hidden flex flex-col font-serif select-none relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      
      {/* Disney Magic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1f3c_0%,#02040a_100%)]" />
      <Sparkles />
      
      {/* Main Photo Viewer - 75% HEIGHT FOCUS */}
      <div className="relative h-[75vh] flex items-center justify-center overflow-hidden px-4 pt-6 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(30px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(30px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-full h-full flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-[95vw] flex items-center justify-center group">
              {/* Cinematic Aura */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/10 via-yellow-200/20 to-purple-600/10 rounded-[3rem] blur-3xl opacity-30" />
              <img
                src={currentPhoto.url}
                className="relative max-w-full max-h-full object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/5"
                alt=""
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Magic Controls */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 z-20 pointer-events-none">
          <motion.button 
            whileHover={{ scale: 1.2, x: -10 }}
            onClick={() => paginate(-1)}
            className={`pointer-events-auto p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all ${currentIndex === 0 ? 'opacity-0 scale-0' : 'opacity-100'}`}
          >
            <span className="text-2xl filter drop-shadow-[0_0_8px_#ffd700]">✨</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.2, x: 10 }}
            onClick={() => paginate(1)}
            className={`pointer-events-auto p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all ${currentIndex === photos.length - 1 ? 'opacity-0 scale-0' : 'opacity-100'}`}
          >
            <span className="text-2xl filter drop-shadow-[0_0_8px_#ffd700]">✨</span>
          </motion.button>
        </div>
      </div>

      {/* 25% Bottom Section */}
      <div className="h-[25vh] relative z-30 w-full flex flex-col justify-center gap-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent">
        
        {/* 1. Thumbnail Strip (Very Minimal & Classy) */}
        <div 
          ref={thumbnailRef}
          className="flex gap-3 overflow-x-auto no-scrollbar px-20 scroll-smooth w-full items-center h-16"
        >
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.1, y: -5 }}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden cursor-pointer transition-all duration-700 ${
                i === currentIndex 
                  ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black scale-125 z-10' 
                  : 'opacity-20 grayscale hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <img src={photo.url} className="w-full h-full object-cover" alt="" />
            </motion.div>
          ))}
        </div>

        {/* 2. Magic Slider */}
        <div className="w-full max-w-3xl mx-auto px-12 relative h-6 flex items-center">
          <div className="absolute inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <input
            type="range"
            min="0"
            max={photos.length - 1}
            value={currentIndex}
            onChange={handleScrub}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => setIsScrubbing(false)}
            className="w-full h-full bg-transparent appearance-none cursor-pointer z-10 disney-slider"
          />
        </div>

        {/* 3. Milestone Bar (Floating above bottom) */}
        <div className="w-full max-w-xl mx-auto flex justify-between items-center relative px-8">
          {milestones.map((milestone) => (
            <motion.button
              key={milestone.id}
              whileHover={{ y: -3 }}
              onClick={() => {
                setDirection(milestone.index > currentIndex ? 1 : -1);
                setCurrentIndex(milestone.index);
              }}
              className={`flex flex-col items-center gap-1 transition-all duration-1000 ${
                currentIndex >= milestone.index ? 'opacity-100' : 'opacity-20'
              }`}
            >
              <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all ${
                currentIndex >= milestone.index ? 'text-yellow-200 shadow-glow' : 'text-white/20'
              }`}>
                {milestone.label}
              </span>
              <div className={`w-1 h-1 rounded-full transition-all duration-700 ${
                currentIndex >= milestone.index ? 'bg-yellow-400 shadow-[0_0_10px_#ffd700]' : 'bg-white/10'
              }`} />
            </motion.button>
          ))}
        </div>

        {/* Audio Pulse */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-yellow-400 animate-ping' : 'bg-white/20'}`} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .shadow-glow { text-shadow: 0 0 10px rgba(255,215,0,0.5); }

        .disney-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #fff;
          border: 2px solid #ffd700;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px #ffd700;
          transition: transform 0.3s ease;
        }
        
        .disney-slider::-webkit-slider-thumb:hover {
          transform: scale(1.4);
        }
      `}} />
    </div>
  );
}
