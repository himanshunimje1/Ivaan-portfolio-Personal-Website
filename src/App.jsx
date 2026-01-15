import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  Float,
  OrbitControls,
  Sparkles,
  Text,
  useProgress,
  useTexture,
} from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'
import { timeline } from './data/timeline'

const FALLBACK_TEXTURE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

function PhotoFrame({ title, color, position, rotation, imageUrl }) {
  const texture = useTexture(imageUrl || FALLBACK_TEXTURE)
  const hasImage = Boolean(imageUrl)

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group position={position} rotation={rotation}>
        <mesh>
          <planeGeometry args={[2.2, 1.4]} />
          <meshStandardMaterial
            color={hasImage ? '#ffffff' : color}
            map={hasImage ? texture : null}
            metalness={0.1}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[2.35, 1.55]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Text
          position={[0, -0.9, 0.1]}
          fontSize={0.2}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      </group>
    </Float>
  )
}

function FloatingScene({ scrollProgress, isDay }) {
  const groupRef = useRef(null)
  const frames = useMemo(() => {
    const spacing = 2.7
    const rotations = [-0.3, 0, 0.3]
    let index = 0

    return timeline.map((chapter) => {
      const column = index % 3
      const row = Math.floor(index / 3)
      const position = [
        (column - 1) * spacing,
        0.5 - row * 1.5,
        row * -1.4,
      ]
      const rotation = [0, rotations[column] ?? 0, 0]
      const item = chapter.items[0]
      index += 1

      return {
        title: item?.title ?? chapter.title,
        color: item?.color ?? '#a5b4fc',
        imageUrl: item?.imageUrl ?? '',
        position,
        rotation,
      }
    })
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const progress = scrollProgress?.get ? scrollProgress.get() : 0
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.12
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.05
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15
    groupRef.current.position.z = -progress * 4
  })

  return (
    <group ref={groupRef}>
      {frames.map((frame) => (
        <PhotoFrame key={`${frame.title}-${frame.position.join('-')}`} {...frame} />
      ))}
      <GhibliGround />
      <CloudCluster position={[-4.8, 2.2, -6]} scale={1.1} />
      <CloudCluster position={[4.2, 2.8, -7.5]} scale={1.3} />
      <CloudCluster position={[0.5, 1.6, -8.6]} scale={0.9} />
      <PaperPlane
        position={[-2.4, 0.8, -5.4]}
        rotation={[0.1, 0.6, 0.1]}
        driftSpeed={0.35}
        driftOffset={0}
      />
      <PaperPlane
        position={[3.2, 1.4, -6.8]}
        rotation={[0.05, -0.5, -0.1]}
        driftSpeed={0.28}
        driftOffset={1.2}
      />
      <Lantern
        position={[-3.2, 0.3, -4.5]}
        floatSpeed={0.5}
        floatOffset={0.6}
        isDay={isDay}
      />
      <Lantern
        position={[2.6, -0.2, -5.2]}
        floatSpeed={0.45}
        floatOffset={1.1}
        isDay={isDay}
      />
      <Lantern
        position={[0.6, 0.8, -7.2]}
        floatSpeed={0.55}
        floatOffset={0.2}
        isDay={isDay}
      />
      <Sparkles
        count={120}
        scale={[12, 7, 12]}
        size={2}
        speed={0.4}
        color="#ffffff"
        opacity={0.55}
      />
      <Sparkles
        count={90}
        scale={[10, 5, 10]}
        size={1.2}
        speed={0.2}
        color="#fde68a"
        opacity={0.7}
      />
      {!isDay && (
        <>
          <mesh position={[4.6, 3.8, -9]}>
            <sphereGeometry args={[0.9, 32, 32]} />
            <meshStandardMaterial color="#e2e8f0" emissive="#e5e7eb" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[4.6, 3.8, -9.4]}>
            <torusGeometry args={[1.3, 0.08, 16, 64]} />
            <meshStandardMaterial color="#93c5fd" emissive="#bfdbfe" emissiveIntensity={0.4} />
          </mesh>
          <Sparkles
            count={160}
            scale={[14, 8, 14]}
            size={1}
            speed={0.15}
            color="#c7d2fe"
            opacity={0.6}
          />
          <Sparkles
            count={120}
            scale={[9, 5, 9]}
            size={1.4}
            speed={0.35}
            color="#a7f3d0"
            opacity={0.7}
          />
        </>
      )}
    </group>
  )
}

function CloudCluster({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.65} />
      </mesh>
      <mesh position={[0.9, -0.1, 0.1]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.9, -0.2, 0]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

function PaperPlane({ position, rotation, driftSpeed = 0.3, driftOffset = 0 }) {
  const planeRef = useRef(null)

  useFrame((state) => {
    if (!planeRef.current) return
    const t = state.clock.elapsedTime * driftSpeed + driftOffset
    planeRef.current.position.y = position[1] + Math.sin(t) * 0.15
    planeRef.current.position.x = position[0] + Math.cos(t * 0.6) * 0.25
    planeRef.current.rotation.z = rotation[2] + Math.sin(t) * 0.1
  })

  return (
    <group ref={planeRef} position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[1.6, 0.9]} />
        <meshStandardMaterial color="#fefce8" side={2} />
      </mesh>
      <mesh position={[0.1, 0.02, 0.02]} rotation={[0, 0, 0.2]}>
        <planeGeometry args={[1.1, 0.5]} />
        <meshStandardMaterial color="#fef9c3" side={2} />
      </mesh>
      <mesh position={[-0.1, -0.02, 0.03]} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[1.1, 0.5]} />
        <meshStandardMaterial color="#fff7ed" side={2} />
      </mesh>
    </group>
  )
}

function Lantern({ position, floatSpeed = 0.4, floatOffset = 0, isDay }) {
  const lanternRef = useRef(null)

  useFrame((state) => {
    if (!lanternRef.current) return
    const t = state.clock.elapsedTime * floatSpeed + floatOffset
    lanternRef.current.position.y = position[1] + Math.sin(t) * 0.25
    lanternRef.current.rotation.y = Math.sin(t * 0.6) * 0.15
  })

  return (
    <group ref={lanternRef} position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 24]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fde68a"
          emissiveIntensity={isDay ? 0.15 : 0.75}
        />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#fbbf24"
          emissiveIntensity={isDay ? 0.3 : 0.95}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  )
}

function GhibliGround() {
  return (
    <group position={[0, -2.7, -4]}>
      <mesh>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#1f2937" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0.8, 0.05, 0.2]} rotation={[-0.4, 0, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.25} />
      </mesh>
      <mesh position={[-1.4, 0.1, -0.3]} rotation={[-0.2, 0, 0]}>
        <circleGeometry args={[1.4, 48]} />
        <meshStandardMaterial color="#111827" transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

function LoadingOverlay() {
  const { active, progress, item } = useProgress()

  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
          Loading memories
        </p>
        <p className="mt-3 text-2xl font-semibold">{Math.round(progress)}%</p>
        <p className="mt-2 text-xs text-slate-400">
          {item ? `Preparing ${item.split('/').pop()}` : 'Preparing gallery'}
        </p>
      </div>
    </div>
  )
}

function AudioPlayer({ isDay, scrollProgress }) {
  const audioRef = useRef(null)
  const windRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [windError, setWindError] = useState(false)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.35
    }
    if (windRef.current) {
      windRef.current.volume = 0
    }
  }, [])

  useEffect(() => {
    const wind = windRef.current
    if (!wind) return
    if (!isPlaying || windError) {
      wind.volume = 0
      wind.pause()
      return
    }

    let raf = 0
    const step = () => {
      if (!windRef.current) return
      const depth = scrollProgress?.get ? scrollProgress.get() : 0
      const target = isDay ? 0 : 0.08 + depth * 0.22
      const current = windRef.current.volume ?? 0
      const next = current + (target - current) * 0.08
      windRef.current.volume = Math.max(0, Math.min(0.35, next))
      raf = requestAnimationFrame(step)
    }

    if (!isDay && wind.paused) {
      wind.play().catch(() => setWindError(true))
    }
    raf = requestAnimationFrame(step)

    return () => cancelAnimationFrame(raf)
  }, [isDay, isPlaying, windError, scrollProgress])

  const togglePlayback = async () => {
    const audio = audioRef.current
    const wind = windRef.current
    if (!audio || hasError) return

    if (audio.paused) {
      try {
        await audio.play()
        if (wind && !windError && !isDay) {
          await wind.play()
        }
        setIsPlaying(true)
      } catch (error) {
        setHasError(true)
        setIsPlaying(false)
      }
    } else {
      audio.pause()
      if (wind) wind.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="pointer-events-auto flex items-center gap-2">
      <audio
        ref={audioRef}
        src="/diary/audio/ambient.mp3"
        loop
        onError={() => setHasError(true)}
      />
      <audio
        ref={windRef}
        src="/diary/audio/wind.mp3"
        loop
        onError={() => setWindError(true)}
      />
      <button
        type="button"
        onClick={togglePlayback}
        className="rounded-full border border-white/30 bg-white/20 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/90 shadow-lg shadow-white/10 transition hover:bg-white/30"
      >
        {hasError
          ? 'Audio Missing'
          : isPlaying
            ? 'Pause Audio'
            : 'Play Audio'}
      </button>
    </div>
  )
}

function TimelinePanel() {
  return (
    <div className="pointer-events-auto w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left text-xs text-slate-200 shadow-lg">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
        Timeline
      </p>
      <div className="mt-4 space-y-3">
        {timeline.map((chapter) => (
          <div key={chapter.id} className="rounded-xl border border-white/10 p-3">
            <p className="text-sm font-semibold text-white">{chapter.title}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
              {chapter.range}
            </p>
            <p className="mt-2 text-[0.7rem] text-slate-300">
              {chapter.items.length} memories · /diary/chapters/{chapter.folder}/
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CloudOverlay({ scrollProgress }) {
  const leftX = useTransform(scrollProgress, [0, 1], [0, 80])
  const rightX = useTransform(scrollProgress, [0, 1], [0, -60])
  const bottomX = useTransform(scrollProgress, [0, 1], [0, 40])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-6 top-10 h-24 w-72 rounded-full bg-white/40 blur-3xl"
        style={{ x: leftX }}
        animate={{ x: [0, 40, 0], y: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-8 top-28 h-28 w-80 rounded-full bg-amber-100/30 blur-3xl"
        style={{ x: rightX }}
        animate={{ x: [0, -30, 0], y: [0, -8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-16 left-1/4 h-32 w-96 rounded-full bg-sky-100/20 blur-3xl"
        style={{ x: bottomX }}
        animate={{ x: [0, 20, 0], y: [0, 12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function ChapterSection({ chapter, index, isDay }) {
  return (
    <motion.section
      className="relative flex min-h-screen snap-start items-center justify-center px-6 py-24"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="absolute left-6 top-10 text-[0.65rem] uppercase tracking-[0.45em] text-white/40">
        Chapter {String(index + 1).padStart(2, '0')}
      </div>
      <motion.div
        className="relative z-10 max-w-2xl overflow-hidden rounded-[32px] border border-white/20 bg-white/10 p-8 text-center backdrop-blur"
        initial={{ scale: 0.95 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        animate={{ rotate: [0, 0.3, -0.2, 0] }}
        transition={{
          scale: { duration: 0.6, ease: 'easeOut' },
          rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {!isDay && (
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-40 -translate-x-1/2 bg-gradient-to-b from-sky-200/30 via-sky-200/10 to-transparent blur-2xl" />
        )}
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
          {chapter.range}
        </p>
        <h2 className="mt-4 text-4xl font-semibold md:text-5xl">
          {chapter.title}
        </h2>
        <p className="mt-4 text-sm text-white/70 md:text-base">
          Add photos to <span className="font-semibold">/diary/chapters/{chapter.folder}</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
          {chapter.items.map((item) => (
            <span
              key={item.id}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1"
            >
              {item.title}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.section>
  )
}

function App() {
  const scrollRef = useRef(null)
  const [isDay, setIsDay] = useState(true)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -40])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b1220] text-white">
      <Canvas
        camera={{ position: [0, 1.2, 8], fov: 50 }}
        className="absolute inset-0"
      >
        <color attach="background" args={[isDay ? '#0b1220' : '#060913']} />
        <ambientLight intensity={isDay ? 0.85 : 0.35} />
        <directionalLight
          position={[4, 5, 2]}
          intensity={isDay ? 1.35 : 0.5}
          color={isDay ? '#fef9c3' : '#93c5fd'}
        />
        <Suspense fallback={null}>
          <FloatingScene scrollProgress={scrollYProgress} isDay={isDay} />
          <Environment preset={isDay ? 'sunset' : 'night'} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDay
            ? 'radial-gradient(circle at top, rgba(255,255,255,0.12), rgba(255,255,255,0) 45%), radial-gradient(circle at 20% 20%, rgba(253,224,71,0.12), rgba(253,224,71,0) 45%), radial-gradient(circle at 80% 10%, rgba(147,197,253,0.12), rgba(147,197,253,0) 40%)'
            : 'radial-gradient(circle at 20% 20%, rgba(147,197,253,0.12), rgba(147,197,253,0) 35%), radial-gradient(circle at 80% 10%, rgba(129,140,248,0.12), rgba(129,140,248,0) 35%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDay
            ? 'radial-gradient(circle at 20% 15%, rgba(255,245,180,0.35), rgba(255,245,180,0) 35%), linear-gradient(180deg, rgba(224,242,254,0.2) 0%, rgba(15,23,42,0) 40%)'
            : 'radial-gradient(circle at 80% 15%, rgba(191,219,254,0.2), rgba(191,219,254,0) 35%), linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(2,6,23,0) 45%)',
        }}
      />
      <CloudOverlay scrollProgress={scrollYProgress} />
      <LoadingOverlay />

      <div className="relative z-10 flex h-full flex-col">
        <motion.header
          className="pointer-events-none px-6 pt-10 text-center"
          style={{ y: heroY }}
        >
          <motion.p
            className="text-xs uppercase tracking-[0.35em] text-white/60"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Ivaan’s 3D Photo Diary
          </motion.p>
          <motion.h1
            className="mt-4 text-4xl font-semibold md:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.9, ease: 'easeOut' }}
          >
            A Ghibli-style story of growing up
          </motion.h1>
          <motion.p
            className="mt-4 text-sm text-white/70 md:text-base"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: 'easeOut' }}
          >
            Scroll through chapters from birth to every year and add your favorite
            photos when you’re ready.
          </motion.p>
        </motion.header>

        <div className="pointer-events-none absolute right-6 top-8 hidden md:block">
          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[0.6rem] uppercase tracking-[0.3em] text-white/70">
            Scroll to explore
          </div>
        </div>

        <div className="pointer-events-none absolute left-6 top-8 hidden md:block">
          <TimelinePanel />
        </div>

        <div className="pointer-events-auto absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDay((prev) => !prev)}
            className="rounded-full border border-white/30 bg-white/20 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-white/90 shadow-lg shadow-white/10 transition hover:bg-white/30"
          >
            {isDay ? 'Night Mode' : 'Day Mode'}
          </button>
          <AudioPlayer isDay={isDay} scrollProgress={scrollYProgress} />
        </div>

        <main
          ref={scrollRef}
          className="relative z-10 mt-8 flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory"
        >
          {timeline.map((chapter, index) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              index={index}
              isDay={isDay}
            />
          ))}
        </main>
      </div>
    </div>
  )
}

export default App
