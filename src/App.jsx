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
      
      {/* Main Photo Viewer - EXTRA BIG */}
      <div className="relative flex-[1.5] flex items-center justify-center overflow-hidden px-4 pt-12 pb-4">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-full h-full flex items-center justify-center p-4"
          >
            <div className="relative w-full h-full max-w-6xl flex items-center justify-center group">
              {/* Golden Magic Frame */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-yellow-600/30 via-yellow-200/40 to-yellow-600/30 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
              <img
                src={currentPhoto.url}
                className="relative max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-yellow-200/20"
                alt=""
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 z-20 pointer-events-none">
          <motion.button 
            whileHover={{ scale: 1.2, rotate: -10 }}
            onClick={() => paginate(-1)}
            className={`pointer-events-auto p-6 rounded-full bg-white/5 backdrop-blur-3xl border border-yellow-200/10 shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
          >
            <span className="text-3xl drop-shadow-[0_0_10px_#ffd700]">✨</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.2, rotate: 10 }}
            onClick={() => paginate(1)}
            className={`pointer-events-auto p-6 rounded-full bg-white/5 backdrop-blur-3xl border border-yellow-200/10 shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'opacity-100'}`}
          >
            <span className="text-3xl drop-shadow-[0_0_10px_#ffd700]">✨</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Tray Section */}
      <div className="relative z-30 w-full flex flex-col gap-6 pb-12 pt-4 bg-gradient-to-t from-black to-transparent">
        
        {/* 1. Thumbnail Strip (Above) */}
        <div 
          ref={thumbnailRef}
          className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-20 scroll-smooth w-full"
        >
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.15, y: -10 }}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`flex-shrink-0 h-24 w-24 rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 shadow-2xl ${
                i === currentIndex 
                  ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#02040a] scale-125 z-10' 
                  : 'opacity-30 grayscale'
              }`}
            >
              <img src={photo.url} className="w-full h-full object-cover" alt="" />
            </motion.div>
          ))}
        </div>

        {/* 2. Magic Scrubber Bar (Middle) */}
        <div className="w-full max-w-4xl mx-auto px-12 relative h-12 flex items-center">
          <div className="absolute inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-yellow-200/20 to-transparent rounded-full" />
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

        {/* 3. Milestones Slider (Very Bottom) */}
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
                  ? 'bg-yellow-400/20 border-yellow-400 shadow-[0_0_20px_#ffd700]' 
                  : 'border-white/10'
              }`}>
                <span className="text-2xl">{milestone.icon}</span>
              </div>
              <span className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${
                currentIndex >= milestone.index ? 'text-yellow-200 shadow-glow' : 'text-white/20'
              }`}>
                {milestone.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Audio Pulse */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="text-[8px] font-bold tracking-[0.5em] uppercase text-yellow-200">Magic Audio</div>
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
          width: 30px;
          height: 30px;
          background: #fff;
          border: 4px solid #ffd700;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 20px #ffd700, inset 0 0 10px #ffd700;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .disney-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3) rotate(45deg);
        }
      `}} />
    </div>
  );
}
