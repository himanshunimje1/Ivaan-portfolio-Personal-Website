import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

const milestones = [
  { id: 'birth', icon: '✨', label: 'Magic Begins', index: 0 },
  { id: 'walk', icon: '👣', label: 'First Steps', index: 4 },
  { id: 'birthday', icon: '🎂', label: 'Golden Year', index: 8 },
  { id: 'school', icon: '🎒', label: 'New World', index: 12 },
];

const UniverseBackground = () => {
  // Video files in public/diary/universe/ folder
  const videos = [
    '/diary/universe/galaxy1.mp4',
    '/diary/universe/galaxy2.mp4',
    '/diary/universe/galaxy3.mp4',
    '/diary/universe/galaxy4.mp4',
  ];
  
  // Fallback bright images if videos not available
  const fallbackImages = [
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2000&auto=format&fit=crop",
  ];
  
  const [index, setIndex] = useState(0);
  const [useVideo, setUseVideo] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleVideoError = () => {
    setUseVideo(false);
  };

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 w-full h-full"
        >
          {useVideo ? (
            <motion.video
              ref={videoRef}
              src={videos[index]}
              autoPlay
              loop
              muted
              playsInline
              onError={handleVideoError}
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(1.8) contrast(1.3) saturate(1.5)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                x: [0, -50, 50, 0],
                y: [0, 30, -30, 0],
              }}
              transition={{
                scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 30, repeat: Infinity, ease: "linear" },
                y: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            />
          ) : (
            <motion.img
              src={fallbackImages[index]}
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(1.8) contrast(1.3) saturate(1.5)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, -60, 60, 0],
                y: [0, 40, -40, 0],
              }}
              transition={{
                scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 35, repeat: Infinity, ease: "linear" },
                y: { duration: 25, repeat: Infinity, ease: "linear" }
              }}
              alt="Universe"
            />
          )}
        </motion.div>
      </AnimatePresence>
      {/* Subtle overlay to keep main photo visible */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
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
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);

  // DeSo-style scroll tracking
  const { scrollYProgress } = useScroll({
    container: containerRef,
    layoutEffect: false
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

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

  // Scroll-based photo navigation
  useEffect(() => {
    if (photos.length === 0) return;
    
    const handleScroll = () => {
      if (isScrubbing) return;
      
      const scrollPos = containerRef.current?.scrollTop || 0;
      const sectionHeight = containerRef.current?.scrollHeight / photos.length || 0;
      const newIndex = Math.min(
        Math.floor(scrollPos / sectionHeight),
        photos.length - 1
      );
      
      if (newIndex !== currentIndex && newIndex >= 0) {
        setDirection(newIndex > currentIndex ? 1 : -1);
        setCurrentIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [photos.length, currentIndex, isScrubbing]);

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
      // Smooth scroll to section
      if (sectionRefs.current[nextIndex]) {
        sectionRefs.current[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
      if (sectionRefs.current[newIndex]) {
        sectionRefs.current[newIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Scroll progress indicator
  const scrollProgressWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  if (photos.length === 0) return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-white tracking-[2em] uppercase text-xs">Entering Space...</motion.div>
    </div>
  );

  const currentPhoto = photos[currentIndex];

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden font-sans select-none relative">
      <audio ref={audioRef} src="/diary/audio/ambient.mp3" loop />
      <UniverseBackground />
      <Fireflies />

      {/* Scroll Progress Bar (DeSo-style) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"
          style={{ width: scrollProgressWidth }}
        />
      </div>

      {/* Top Title - Sticky */}
      <motion.div 
        className="fixed top-8 left-0 right-0 z-40 text-center pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[10px] font-bold tracking-[1.5em] uppercase text-white/40 ml-[1.5em]">
          Ivaan Portfolio
        </h1>
      </motion.div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Photo Sections - DeSo-style sticky reveals */}
        <div className="relative">
          {photos.map((photo, i) => {
            const isActive = i === currentIndex;
            const milestone = milestones.find(m => m.index === i);
            
            return (
              <motion.section
                key={photo.id}
                ref={(el) => (sectionRefs.current[i] = el)}
                className="h-screen w-full flex items-center justify-center relative"
                style={{ perspective: '700px' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Sticky Photo Container */}
                <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 py-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -15 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3,
                      scale: isActive ? 1 : 0.9,
                      y: isActive ? 0 : 30,
                      rotateX: isActive ? 0 : -10
                    }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-full max-w-6xl flex items-center justify-center group"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Glow Effect */}
                    <motion.div 
                      className="absolute -inset-10 bg-white/5 rounded-full blur-[100px]"
                      animate={{ 
                        opacity: isActive ? 0.3 : 0.1,
                        scale: isActive ? 1.2 : 0.8
                      }}
                      transition={{ duration: 0.6 }}
                    />
                    
                    {/* Photo */}
                    <motion.img
                      src={photo.url}
                      className="relative max-w-full max-h-[75vh] object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
                      alt=""
                      style={{ 
                        filter: isActive ? 'blur(0px)' : 'blur(2px)',
                        willChange: 'filter, transform'
                      }}
                    />

                    {/* Milestone Label - DeSo-style reveal */}
                    {milestone && (
                      <motion.div
                        className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-4"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0.3,
                          x: isActive ? 0 : -30
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <motion.div
                          className="h-[2px] bg-gradient-to-r from-yellow-400 to-transparent"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isActive ? 1 : 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          style={{ width: '80px' }}
                        />
                        <div className="flex flex-col gap-2">
                          <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">
                            {milestone.label}
                          </span>
                          <span className="text-2xl">{milestone.icon}</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons - Fixed */}
      <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-10 z-30 pointer-events-none">
        <motion.button 
          whileHover={{ scale: 1.2, x: -10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(-1)}
          className={`pointer-events-auto p-6 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <span className="text-3xl drop-shadow-[0_0_10px_white]">✨</span>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.2, x: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(1)}
          className={`pointer-events-auto p-6 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all ${currentIndex === photos.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{ transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <span className="text-3xl drop-shadow-[0_0_10px_white]">✨</span>
        </motion.button>
      </div>

      {/* Bottom UI - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-6 pb-10 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          {/* Thumbnail Strip */}
          <div 
            ref={thumbnailRef}
            className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-20 scroll-smooth w-full items-center h-24"
          >
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                whileHover={{ scale: 1.1, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                  if (sectionRefs.current[i]) {
                    sectionRefs.current[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex-shrink-0 h-16 w-16 rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 shadow-2xl ${
                  i === currentIndex 
                    ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-black scale-125 z-10' 
                    : 'opacity-20 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
                style={{ transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <img src={photo.url} className="w-full h-full object-cover" alt="" />
              </motion.div>
            ))}
          </div>

          {/* Scrubber Slider */}
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

          {/* Milestone Icons */}
          <div className="w-full max-w-2xl mx-auto flex justify-between items-center relative px-8 py-2">
            {milestones.map((milestone) => (
              <motion.button
                key={milestone.id}
                whileHover={{ scale: 1.2, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setDirection(milestone.index > currentIndex ? 1 : -1);
                  setCurrentIndex(milestone.index);
                  if (sectionRefs.current[milestone.index]) {
                    sectionRefs.current[milestone.index].scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex flex-col items-center gap-3 transition-all duration-1000 ${
                  currentIndex >= milestone.index ? 'opacity-100' : 'opacity-20'
                }`}
                style={{ transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <motion.div 
                  className={`p-4 rounded-full border transition-all duration-700 ${
                    currentIndex >= milestone.index 
                      ? 'bg-yellow-400/20 border-yellow-400 shadow-[0_0_20px_rgba(255,218,89,0.5)]' 
                      : 'border-white/10'
                  }`}
                  animate={{
                    scale: currentIndex >= milestone.index ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 2, repeat: currentIndex >= milestone.index ? Infinity : 0 }}
                >
                  <span className="text-2xl">{milestone.icon}</span>
                </motion.div>
                <span className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${
                  currentIndex >= milestone.index ? 'text-yellow-400 shadow-glow' : 'text-white/20'
                }`}>
                  {milestone.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Audio Control */}
        <div className="absolute bottom-4 left-6 opacity-30 hover:opacity-100 transition-opacity pointer-events-auto">
          <button 
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
            className="flex items-center gap-3"
          >
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-yellow-400 animate-ping' : 'bg-white/20'}`} />
            <span className="text-[8px] font-bold tracking-widest uppercase">Audio</span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .shadow-glow { text-shadow: 0 0 15px rgba(255,218,89,0.8); }

        .universe-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #FFDA59;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(255,218,89,0.6);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .universe-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 30px rgba(255,218,89,0.8);
        }
      `}} />
    </div>
  );
}
