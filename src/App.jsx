import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const milestones = [
  { id: 'birth', icon: '✨', label: 'Magic Begins', index: 0 },
  { id: 'walk', icon: '👣', label: 'First Steps', index: 4 },
  { id: 'birthday', icon: '🎂', label: 'Golden Year', index: 8 },
  { id: 'school', icon: '🎒', label: 'New World', index: 12 },
];

// High-definition James Webb / Universe background images
const universeImages = [
  "https://stsci-opo.org/STScI-01G8G07Z9P362V73FR7A7QN88B.png", // Carina Nebula
  "https://stsci-opo.org/STScI-01G8GYE3S6ZPV9Z5X6XJZJG0Z5.png", // Southern Ring Nebula
  "https://stsci-opo.org/STScI-01G8H0E8Z9P362V73FR7A7QN88B.png", // Stephan's Quintet
  "https://stsci-opo.org/STScI-01G8H1E8Z9P362V73FR7A7QN88B.png", // Deep Field
];

const UniverseBackground = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % universeImages.length);
    }, 6000); // Change every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ 
            opacity: 0.4, 
            scale: 1,
            x: [0, -20, 20, 0],
            y: [0, 10, -10, 0]
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            opacity: { duration: 2 },
            scale: { duration: 8, ease: "linear" },
            x: { duration: 20, repeat: Infinity, ease: "linear" },
            y: { duration: 15, repeat: Infinity, ease: "linear" }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={universeImages[index]} 
            className="w-full h-full object-cover" 
            alt="Universe" 
          />
        </motion.div>
      </AnimatePresence>
      {/* Dark overlay to make the main content pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-1" />
    </div>
  );
};

const Sparkles = () => {
  const [particles] = useState(() => Array.from({ length: 30 }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: 0 
          }}
          animate={{
            x: [null, Math.random() * window.innerWidth],
            y: [null, Math.random() * window.innerHeight],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-0.5 h-0.5 bg-white rounded-full blur-[0.5px]"
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
        Opening the Universe...
      </motion.div>
    </div>
  );

  const currentPhoto = photos[currentIndex];

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col font-serif select-none relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      
      {/* Dynamic Universe Background */}
      <UniverseBackground />
      <Sparkles />
      
      {/* Main Photo Viewer - 75% HEIGHT FOCUS */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden px-4 pt-10 pb-2 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(40px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(40px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-full h-full flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-[95vw] flex items-center justify-center">
              {/* Magic Glow Border */}
              <div className="absolute -inset-4 bg-white/5 rounded-2xl blur-2xl" />
              <img
                src={currentPhoto.url}
                className="relative max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.9)] border border-white/10"
                alt=""
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 z-20 pointer-events-none">
          <motion.button 
            whileHover={{ scale: 1.2, x: -10 }}
            onClick={() => paginate(-1)}
            className={`pointer-events-auto p-5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all ${currentIndex === 0 ? 'opacity-0 scale-0' : 'opacity-100'}`}
          >
            <span className="text-2xl filter drop-shadow-[0_0_8px_#fff]">✨</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.2, x: 10 }}
            onClick={() => paginate(1)}
            className={`pointer-events-auto p-5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all ${currentIndex === photos.length - 1 ? 'opacity-0 scale-0' : 'opacity-100'}`}
          >
            <span className="text-2xl filter drop-shadow-[0_0_8px_#fff]">✨</span>
          </motion.button>
        </div>
      </div>

      {/* 30% Bottom Section */}
      <div className="h-[30vh] relative z-30 w-full flex flex-col justify-end gap-4 pb-10 pt-2">
        
        {/* 1. Thumbnail Strip */}
        <div 
          ref={thumbnailRef}
          className="flex gap-3 overflow-x-auto no-scrollbar px-20 scroll-smooth w-full items-center h-20"
        >
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.1, y: -5 }}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden cursor-pointer transition-all duration-700 ${
                i === currentIndex 
                  ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-125 z-10' 
                  : 'opacity-20 grayscale hover:grayscale-0 hover:opacity-80'
              }`}
            >
              <img src={photo.url} className="w-full h-full object-cover" alt="" />
            </motion.div>
          ))}
        </div>

        {/* 2. Magic Slider */}
        <div className="w-full max-w-3xl mx-auto px-12 relative h-6 flex items-center">
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

        {/* 3. Milestone Bar */}
        <div className="w-full max-w-xl mx-auto flex justify-between items-center relative px-8 pb-4">
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
                currentIndex >= milestone.index ? 'text-white shadow-glow' : 'text-white/20'
              }`}>
                {milestone.label}
              </span>
              <div className={`w-1 h-1 rounded-full transition-all duration-700 ${
                currentIndex >= milestone.index ? 'bg-white shadow-[0_0_10px_#fff]' : 'bg-white/10'
              }`} />
            </motion.button>
          ))}
        </div>

        {/* Audio Control */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
            className="p-2"
          >
            <div className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-white animate-ping' : 'bg-white/20'}`} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .shadow-glow { text-shadow: 0 0 10px rgba(255,255,255,0.5); }

        .universe-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px #fff;
          transition: transform 0.3s ease;
        }
        
        .universe-slider::-webkit-slider-thumb:hover {
          transform: scale(1.5);
        }
      `}} />
    </div>
  );
}
