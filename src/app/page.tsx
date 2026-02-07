'use client'

import NotesManager from "@/components/NotesManager"
import RemindersManager from "@/components/RemindersManager"
import { signout } from './login/actions'

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        paddingBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: 0,
            background: 'linear-gradient(to right, #fff, #999)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ORKAN NOTLARI
          </h1>
          <span style={{
            color: 'var(--accent)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            fontSize: '0.9rem'
          }}>
            V FOR VENDETTA EDITION
          </span>
        </div>

        <form action={signout}>
          <button
            type="submit"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Çıkış Yap
          </button>
        </form>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        flex: 1,
        minHeight: 0
      }}>
        <section style={{ height: '600px' }}>
          <NotesManager />
        </section>

        <section style={{ height: '600px' }}>
          <RemindersManager />
        </section>
      </div>
    </main>
  )
}
