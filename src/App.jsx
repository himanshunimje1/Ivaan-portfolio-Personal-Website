import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const milestones = [
  { id: 'birth', icon: '✨', label: 'Magic Begins', index: 0 },
  { id: 'walk', icon: '👣', label: 'First Steps', index: 4 },
  { id: 'birthday', icon: '🎂', label: 'Golden Year', index: 8 },
  { id: 'school', icon: '🎒', label: 'New World', index: 12 },
];

// Futuristic dark background
const Background = () => {
  const [stars] = useState(() => 
    Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      twinkle: Math.random() * 2 + 1,
      delay: Math.random() * 5
    }))
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(ellipse at center, #0a0e27 0%, #050810 40%, #000000 100%)'
        }}
      />
      
      <div 
        className="absolute inset-0 w-full h-full opacity-70"
        style={{
          background: 'linear-gradient(180deg, #0f1629 0%, #0a0e27 30%, #000000 70%, #000000 100%)'
        }}
      />

      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'radial-gradient(circle, #00F0FF 0%, #0099FF 50%, transparent 100%)',
              boxShadow: `0 0 ${star.size * 2}px rgba(0, 240, 255, 0.4)`
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: star.twinkle,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Simplified fireflies
const Fireflies = () => {
  const [flies] = useState(() => 
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      duration: 8 + Math.random() * 8,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {flies.map((fly, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${fly.x}%`,
            top: `${fly.y}%`,
            width: `${fly.size}px`,
            height: `${fly.size}px`,
            background: 'radial-gradient(circle, #00F0FF 0%, transparent 100%)',
            boxShadow: `0 0 ${fly.size * 2}px rgba(0, 240, 255, 0.5)`,
          }}
          animate={{
            x: [
              fly.x + "%",
              (fly.x + (Math.random() - 0.5) * 20) + "%",
              fly.x + "%"
            ],
            y: [
              fly.y + "%",
              (fly.y + (Math.random() - 0.5) * 15) + "%",
              fly.y + "%"
            ],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: fly.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: fly.delay
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
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

  // Simple scroll navigation
  useEffect(() => {
    if (photos.length === 0 || isScrubbing) return;
    
    let scrollTimeout;
    const handleWheel = (e) => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
          paginate(1);
        } else if (e.deltaY < 0) {
          paginate(-1);
        }
      }, 50);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, photos.length, isScrubbing]);

  useEffect(() => {
    if (thumbnailRef.current) {
      const activeThumb = thumbnailRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentIndex]);

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
      <motion.div 
        animate={{ opacity: [0.3, 1, 0.3] }} 
        transition={{ duration: 2, repeat: Infinity }} 
        className="text-white tracking-[2em] uppercase text-xs"
      >
        Loading...
      </motion.div>
    </div>
  );

  const currentPhoto = photos[currentIndex];

  // Simple slide variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden font-sans select-none relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      <Background />
      <Fireflies />

      {/* Top Title */}
      <div className="fixed top-8 left-0 right-0 z-40 text-center pointer-events-none">
        <h1 className="text-[10px] font-bold tracking-[1.5em] uppercase text-white/40 ml-[1.5em]">
          Ivaan Portfolio
        </h1>
      </div>

      {/* Main Photo Display */}
      <div className="fixed inset-0 flex items-center justify-center z-20 px-4">
        <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={currentPhoto.id}
              src={currentPhoto.url}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.2 }
              }}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              alt=""
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-10 z-30 pointer-events-none">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(-1)}
          className={`pointer-events-auto p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <span className="text-2xl">←</span>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(1)}
          className={`pointer-events-auto p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 ${currentIndex === photos.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <span className="text-2xl">→</span>
        </motion.button>
      </div>

      {/* Bottom UI */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-4 pb-8 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          {/* Thumbnail Strip */}
          <div 
            ref={thumbnailRef}
            className="flex gap-3 overflow-x-auto no-scrollbar py-3 px-12 scroll-smooth w-full items-center h-20"
          >
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={`flex-shrink-0 h-14 w-14 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  i === currentIndex 
                    ? 'scale-110 opacity-100' 
                    : 'opacity-30 hover:opacity-60'
                }`}
                style={i === currentIndex ? {
                  border: '2px solid #00F0FF',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.6)'
                } : {}}
              >
                <img src={photo.url} className="w-full h-full object-cover" alt="" />
              </motion.div>
            ))}
          </div>

          {/* Scrubber Slider */}
          <div className="w-full max-w-3xl mx-auto px-8 relative h-8 flex items-center">
            <div className="absolute inset-x-8 h-[1px] bg-white/10 rounded-full" />
            <input
              type="range"
              min="0"
              max={photos.length - 1}
              value={currentIndex}
              onChange={handleScrub}
              onMouseDown={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
              className="w-full h-full bg-transparent appearance-none cursor-pointer z-10 slider"
            />
          </div>

          {/* Milestone Icons */}
          <div className="w-full max-w-2xl mx-auto flex justify-between items-center relative px-6 py-2">
            {milestones.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => {
                  setDirection(milestone.index > currentIndex ? 1 : -1);
                  setCurrentIndex(milestone.index);
                }}
                className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                  currentIndex >= milestone.index ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div 
                  className={`p-3 rounded-full border transition-all duration-300 ${
                    currentIndex >= milestone.index 
                      ? 'border-white/30' 
                      : 'border-white/10'
                  }`}
                  style={currentIndex >= milestone.index ? {
                    background: 'rgba(0, 240, 255, 0.1)',
                    borderColor: '#00F0FF',
                    boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
                  } : {}}
                >
                  <span className="text-xl">{milestone.icon}</span>
                </div>
                <span 
                  className={`text-[9px] font-bold tracking-[0.2em] uppercase ${
                    currentIndex >= milestone.index ? '' : 'text-white/20'
                  }`}
                  style={currentIndex >= milestone.index ? {
                    color: '#00F0FF',
                    textShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
                  } : {}}
                >
                  {milestone.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Control */}
        <div className="absolute bottom-4 left-6 opacity-40 hover:opacity-100 transition-opacity pointer-events-auto">
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
            className="flex items-center gap-2"
          >
            <div 
              className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : 'bg-white/20'}`}
              style={isPlaying ? {
                background: '#00F0FF',
                boxShadow: '0 0 8px rgba(0, 240, 255, 0.8)'
              } : {}}
            />
            <span className="text-[8px] font-bold tracking-widest uppercase">Audio</span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #00F0FF;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
          transition: transform 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.8);
        }
      `}} />
    </div>
  );
}
