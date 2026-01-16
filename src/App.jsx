import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

const milestones = [
  { id: 'birth', icon: '✨', label: 'Magic Begins', index: 0 },
  { id: 'walk', icon: '👣', label: 'First Steps', index: 4 },
  { id: 'birthday', icon: '🎂', label: 'Golden Year', index: 8 },
  { id: 'school', icon: '🎒', label: 'New World', index: 12 },
];

// Disney-style magical night sky background
const DisneyBackground = () => {
  const [stars] = useState(() => 
    Array.from({ length: 150 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      twinkle: Math.random() * 2 + 1,
      delay: Math.random() * 5
    }))
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Futuristic dark gradient */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(ellipse at center, #0a0e27 0%, #050810 40%, #000000 100%)'
        }}
      />
      
      {/* Secondary gradient for depth - modern dark theme */}
      <div 
        className="absolute inset-0 w-full h-full opacity-70"
        style={{
          background: 'linear-gradient(180deg, #0f1629 0%, #0a0e27 30%, #000000 70%, #000000 100%)'
        }}
      />

      {/* Futuristic cyan accent gradient */}
      <div 
        className="absolute inset-0 w-full h-full opacity-5"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(0, 240, 255, 0.1) 0%, transparent 70%)'
        }}
      />

      {/* Twinkling Stars - Futuristic cyan glow */}
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
              boxShadow: `0 0 ${star.size * 2}px rgba(0, 240, 255, 0.6), 0 0 ${star.size * 4}px rgba(0, 240, 255, 0.3)`
            }}
            animate={{
              opacity: [0.3, 1, 0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8, 1.1, 0.8],
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

      {/* Futuristic energy layers */}
      <motion.div
        className="absolute inset-0 opacity-8"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(0, 240, 255, 0.08) 0%, transparent 50%)'
        }}
        animate={{
          x: [0, 50, 0],
          opacity: [0.03, 0.12, 0.03]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-6"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(0, 153, 255, 0.06) 0%, transparent 50%)'
        }}
        animate={{
          x: [0, -40, 0],
          opacity: [0.02, 0.10, 0.02]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Subtle radial overlay for photo focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
    </div>
  );
};

// Disney-style magical fireflies
const Fireflies = () => {
  const [flies] = useState(() => 
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 5,
      glow: Math.random() * 0.5 + 0.5
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {flies.map((fly, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: fly.x + "%", 
            y: fly.y + "%",
            opacity: 0 
          }}
          animate={{
            x: [
              fly.x + "%",
              (fly.x + (Math.random() - 0.5) * 30) + "%",
              (fly.x + (Math.random() - 0.5) * 40) + "%",
              (fly.x + (Math.random() - 0.5) * 30) + "%",
              fly.x + "%"
            ],
            y: [
              fly.y + "%",
              (fly.y + (Math.random() - 0.5) * 20) + "%",
              (fly.y + (Math.random() - 0.5) * 30) + "%",
              (fly.y + (Math.random() - 0.5) * 20) + "%",
              fly.y + "%"
            ],
            opacity: [0, fly.glow, 0.3, fly.glow, 0.2, fly.glow, 0],
            scale: [0, 1.3, 0.7, 1.1, 0.8, 1, 0],
          }}
          transition={{
            duration: fly.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: fly.delay
          }}
          className="absolute rounded-full"
          style={{
            width: `${fly.size}px`,
            height: `${fly.size}px`,
            background: 'radial-gradient(circle, #00F0FF 0%, #0099FF 50%, transparent 100%)',
            boxShadow: `0 0 ${fly.size * 3}px #00F0FF, 0 0 ${fly.size * 5}px rgba(0, 240, 255, 0.6)`,
            filter: 'blur(0.5px)'
          }}
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
      <DisneyBackground />
      <Fireflies />

      {/* Scroll Progress Bar (Futuristic) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <motion.div 
          className="h-full"
          style={{ 
            width: scrollProgressWidth,
            background: 'linear-gradient(90deg, #00F0FF 0%, #0099FF 50%, #00F0FF 100%)',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.8)'
          }}
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
                          className="h-[2px]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isActive ? 1 : 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          style={{ 
                            width: '80px',
                            background: 'linear-gradient(90deg, #00F0FF 0%, transparent 100%)',
                            boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
                          }}
                        />
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold tracking-widest uppercase"
                            style={{ color: '#00F0FF', textShadow: '0 0 10px rgba(0, 240, 255, 0.8)' }}
                          >
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
                    ? 'ring-4 ring-offset-4 ring-offset-black scale-125 z-10' 
                    : 'opacity-20 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
                style={i === currentIndex ? {
                  border: '4px solid #00F0FF',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.4)'
                } : {}}
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
                      ? 'border-white/20' 
                      : 'border-white/10'
                  }`}
                  style={currentIndex >= milestone.index ? {
                    background: 'rgba(0, 240, 255, 0.15)',
                    borderColor: '#00F0FF',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), inset 0 0 20px rgba(0, 240, 255, 0.2)'
                  } : {}}
                  animate={{
                    scale: currentIndex >= milestone.index ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 2, repeat: currentIndex >= milestone.index ? Infinity : 0 }}
                >
                  <span className="text-2xl">{milestone.icon}</span>
                </motion.div>
                <span 
                  className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${
                    currentIndex >= milestone.index ? 'shadow-glow' : 'text-white/20'
                  }`}
                  style={currentIndex >= milestone.index ? {
                    color: '#00F0FF',
                    textShadow: '0 0 15px rgba(0, 240, 255, 0.8)'
                  } : {}}
                >
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
            <div 
              className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-ping' : 'bg-white/20'}`}
              style={isPlaying ? {
                background: '#00F0FF',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.8)'
              } : {}}
            />
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
          background: #00F0FF;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.4);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .universe-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 0 30px rgba(0, 240, 255, 1), 0 0 60px rgba(0, 240, 255, 0.6);
        }
      `}} />
    </div>
  );
}
