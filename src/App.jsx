import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Add scroll/wheel listener for picture changing
  useEffect(() => {
    const handleWheel = (e) => {
      // deltaY > 0 means scroll down -> next picture (right)
      // deltaY < 0 means scroll up -> previous picture (left)
      if (Math.abs(e.deltaY) > 30) { // Threshold to prevent too fast switching
        if (e.deltaY > 0) {
          paginate(1);
        } else {
          paginate(-1);
        }
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
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
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
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={currentPhoto.url}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
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

      {/* Bottom Filmstrip & Tools */}
      <div className="bg-gradient-to-t from-black to-transparent pt-10 pb-8 px-4 flex flex-col gap-6 z-30">
        
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
          {/* Audio toggle in place of old icons */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl rounded-full px-6 py-2.5 border border-white/10 shadow-xl">
            <button 
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                  setIsPlaying(!isPlaying);
                }
              }}
              className="flex items-center gap-3 group"
            >
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isPlaying ? 'bg-blue-400 shadow-[0_0_10px_cyan] scale-110' : 'bg-white/10'}`} />
              <span className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-colors ${isPlaying ? 'text-white' : 'text-white/30'}`}>
                {isPlaying ? 'Sound Active' : 'Sound Muted'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
