import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { timeline } from './data/timeline'

const formatTitle = (title) => title.replace(/month/i, 'Month')

function EventCard({ event, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
        isActive
          ? 'border-white/40 bg-white/10 text-white'
          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
      }`}
    >
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
          {event.range}
        </p>
        <p className="mt-2 text-lg font-semibold">{formatTitle(event.title)}</p>
      </div>
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">
        {event.photos.length} photos
      </div>
    </button>
  )
}

function App() {
  const [activeEventId, setActiveEventId] = useState(timeline[0]?.id ?? '')
  const activeEvent = useMemo(
    () => timeline.find((event) => event.id === activeEventId) ?? timeline[0],
    [activeEventId],
  )

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0d12]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60">
            Ivaan Nimje
          </div>
          <div className="flex items-center gap-8 text-[0.65rem] uppercase tracking-[0.4em] text-white/50">
            <span className="transition hover:text-white">Gallery</span>
            <span className="transition hover:text-white">Timeline</span>
            <span className="transition hover:text-white">About</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-16">
        <div className="space-y-6">
          <p className="text-[0.65rem] uppercase tracking-[0.55em] text-white/60">
            Picasso-inspired gallery
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Choose a moment to explore
          </h1>
          <p className="max-w-2xl text-base text-white/70 md:text-lg">
            Select a milestone to reveal a curated set of photos. Birth, monthly
            memories, and yearly highlights live in one place.
          </p>
        </div>

        <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            {timeline.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isActive={event.id === activeEventId}
                onClick={() => setActiveEventId(event.id)}
              />
            ))}
          </div>

          <motion.div
            key={activeEvent?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.45em] text-white/40">
                  {activeEvent?.range}
                </p>
                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                  {activeEvent?.title}
                </h2>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                {activeEvent?.photos.length ?? 0} photos
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeEvent?.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  <div
                    className="h-56 w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                    style={{
                      background: photo.imageUrl ? `url(${photo.imageUrl})` : photo.color,
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{photo.title}</h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
                      {activeEvent?.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              Add photos inside <span className="text-white/80">/diary/chapters/{activeEvent?.folder}</span>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}

export default App
