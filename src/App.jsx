import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Center the active thumbnail when index changes
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

  // Scrubber handler
  const handleScrub = (e) => {
    const newIndex = parseInt(e.target.value);
    if (newIndex !== currentIndex) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentIndex(newIndex);
    }
  };

  // Add scroll/wheel listener for picture changing
  useEffect(() => {
    let lastScrollTime = 0;
    const handleWheel = (e) => {
      const now = Date.now();
      if (now - lastScrollTime < 300) return; // Prevent too rapid switching

      if (Math.abs(e.deltaY) > 20) {
        if (e.deltaY > 0) {
          paginate(1);
        } else {
          paginate(-1);
        }
        lastScrollTime = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, photos.length]);

  if (photos.length === 0) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  const currentPhoto = photos[currentIndex];

  const variants = {
    enter: {
      y: 600,
      scale: 0.1,
      opacity: 0,
      filter: "blur(10px)"
    },
    center: {
      y: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)"
    },
    exit: {
      y: 600,
      scale: 0.1,
      opacity: 0,
      filter: "blur(10px)"
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col font-sans select-none">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 w-full z-30 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button className="p-2 opacity-0 pointer-events-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-center">
          <div className="text-[11px] font-semibold tracking-wider uppercase">Ivaan Portfolio</div>
        </div>

        <button className="p-2 opacity-0 pointer-events-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
        </button>
      </div>

      {/* Main Photo Viewer */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-20">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={currentPhoto.url}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: "spring", stiffness: 200, damping: 25 },
              scale: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.3 }
            }}
            className="max-w-full max-h-full object-contain shadow-[0_50px_100px_rgba(0,0,0,0.9)] rounded-lg border border-white/5"
            style={{ position: 'absolute' }}
          />
        </AnimatePresence>

        {/* Navigation Arrows (Circle Buttons) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-20 pointer-events-none">
          <button 
            onClick={() => paginate(-1)}
            disabled={currentIndex === 0}
            className={`pointer-events-auto p-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => paginate(1)}
            disabled={currentIndex === photos.length - 1}
            className={`pointer-events-auto p-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'opacity-100'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Bottom Scrubber & Filmstrip */}
      <div className="bg-gradient-to-t from-black to-transparent pt-10 pb-8 px-4 flex flex-col gap-8 z-30">
        
        {/* Apple Style Slider Bar */}
        <div className="w-full max-w-lg mx-auto px-10 relative group">
          <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 rounded-full" />
          <input
            type="range"
            min="0"
            max={photos.length - 1}
            value={currentIndex}
            onChange={handleScrub}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => setIsScrubbing(false)}
            onTouchStart={() => setIsScrubbing(true)}
            onTouchEnd={() => setIsScrubbing(false)}
            className="relative w-full h-8 bg-transparent appearance-none cursor-pointer z-10 apple-slider"
          />
          {/* Index Counter */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-white/30 font-medium tracking-[0.3em] uppercase">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>

        {/* Thumbnail Scrubber */}
        <div 
          ref={thumbnailRef}
          className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 px-10 scroll-smooth"
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`flex-shrink-0 h-12 w-12 rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${
                i === currentIndex 
                  ? 'scale-125 border-2 border-blue-400 opacity-100 z-10 shadow-[0_0_15px_rgba(0,150,255,0.4)]' 
                  : 'opacity-30 hover:opacity-100 scale-90'
              }`}
            >
              <img src={photo.url} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
        </div>

        {/* Bottom Actions Bar - Minimalized */}
        <div className="flex items-center justify-center px-6 text-white/80 max-w-md mx-auto w-full">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl rounded-full px-6 py-2 border border-white/10 shadow-xl">
            <button 
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                  setIsPlaying(!isPlaying);
                }
              }}
              className="flex items-center gap-3"
            >
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isPlaying ? 'bg-blue-400 shadow-[0_0_10px_cyan]' : 'bg-white/10'}`} />
              <span className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors ${isPlaying ? 'text-white' : 'text-white/20'}`}>
                Audio
              </span>
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .apple-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          transition: transform 0.2s ease;
        }
        
        .apple-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .apple-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
      `}} />
    </div>
  );
}
