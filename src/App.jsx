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
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-center">
          <div className="text-[11px] font-semibold">Ivaan Portfolio</div>
          <div className="text-[9px] text-white/50 tracking-wide">3 January • 9:38 PM</div>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
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
            className={`pointer-events-auto p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all ${currentIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => paginate(1)}
            disabled={currentIndex === photos.length - 1}
            className={`pointer-events-auto p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all ${currentIndex === photos.length - 1 ? 'opacity-0' : 'opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
              className={`flex-shrink-0 h-10 w-10 rounded-sm overflow-hidden cursor-pointer transition-all duration-300 ${
                i === currentIndex 
                  ? 'scale-125 border-2 border-white opacity-100' 
                  : 'opacity-40 hover:opacity-100'
              }`}
            >
              <img src={photo.url} className="w-full h-full object-cover" alt="" />
            </div>
          ))}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between px-6 text-white/80 max-w-md mx-auto w-full">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></button>
          
          {/* Main Navigation Control Area */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 hover:text-white transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-400 shadow-[0_0_10px_cyan]' : 'bg-white/20'}`} />
            </button>
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Audio</span>
          </div>

          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
