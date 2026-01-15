import { timeline } from './data/timeline'

function App() {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0d12]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60">
            Ivaan’s Photo Diary
          </div>
          <div className="flex items-center gap-8 text-[0.65rem] uppercase tracking-[0.4em] text-white/50">
            <span className="transition hover:text-white">Chapters</span>
            <span className="transition hover:text-white">Memories</span>
            <span className="transition hover:text-white">About</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-14 px-6 pb-28 pt-20 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <div className="sticky top-28 space-y-4 text-[0.6rem] uppercase tracking-[0.45em] text-white/50">
            <div className="text-white/40">Chapters</div>
            {timeline.map((chapter, index) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                className="flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.4em] text-white/60 transition hover:text-white"
              >
                <span className="text-white/35">{String(index + 1).padStart(2, '0')}</span>
                <span className="whitespace-nowrap">{chapter.title}</span>
              </a>
            ))}
          </div>
        </aside>

        <section className="space-y-20">
          <div className="space-y-7">
            <p className="text-[0.65rem] uppercase tracking-[0.55em] text-white/60">
              Chapter 01 — Welcome
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl lg:text-7xl">
              The story of Ivaan, told one memory at a time
            </h1>
            <p className="max-w-2xl text-base text-white/70 md:text-lg">
              Scroll through chapters from birth to each year. Add your photos and
              captions to create a gentle timeline that grows with him.
            </p>
          </div>

          {timeline.map((chapter, index) => (
            <section key={chapter.id} id={chapter.id} className="border-t border-white/5 pt-16">
              <p className="text-[0.65rem] uppercase tracking-[0.55em] text-white/50">
                Chapter {String(index + 1).padStart(2, '0')}
              </p>
              <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl">
                    {chapter.title}
                  </h2>
                  <p className="mt-3 text-[0.65rem] uppercase tracking-[0.5em] text-white/50">
                    {chapter.range}
                  </p>
                </div>
                <div className="text-[0.65rem] uppercase tracking-[0.45em] text-white/40">
                  {chapter.items.length} memories
                </div>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {chapter.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div
                      className="h-48 w-full rounded-xl"
                      style={{ background: item.color }}
                    />
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-white/60">
                      Add photos in <span className="text-white/80">/diary/chapters/{chapter.folder}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
