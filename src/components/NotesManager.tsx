'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Plus, Loader2 } from 'lucide-react'

type Note = {
    id: string
    title: string
    content: string
    created_at: string
}

export default function NotesManager() {
    const [notes, setNotes] = useState<Note[]>([])
    const [newNoteTitle, setNewNoteTitle] = useState('')
    const [newNoteContent, setNewNoteContent] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchNotes()

        const subscription = supabase
            .channel('notes_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
                fetchNotes()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const fetchNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setNotes(data || [])
        } catch (error) {
            console.error('Error fetching notes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddNote = async () => {
        if (!newNoteTitle.trim() && !newNoteContent.trim()) return

        try {
            const { error } = await supabase
                .from('notes')
                .insert([{ title: newNoteTitle, content: newNoteContent }])

            if (error) throw error

            setNewNoteTitle('')
            setNewNoteContent('')
            setIsAdding(false)
        } catch (error) {
            console.error('Error adding note:', error)
        }
    }

    const handleDeleteNote = async (id: string) => {
        try {
            const { error } = await supabase.from('notes').delete().eq('id', id)
            if (error) throw error
        } catch (error) {
            console.error('Error deleting note:', error)
        }
    }

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>

    return (
        <div style={{
            background: 'var(--muted)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem' }}>NOTLAR</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Plus size={18} />
                </button>
            </div>

            {isAdding && (
                <div style={{
                    marginBottom: '1.5rem',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--accent)'
                }}>
                    <input
                        type="text"
                        placeholder="Başlık"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--foreground)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <textarea
                        placeholder="Notunuzu buraya yazın..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#a1a1aa',
                            fontSize: '0.9rem',
                            minHeight: '80px',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button
                            onClick={handleAddNote}
                            style={{
                                background: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                padding: '0.4rem 1rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            Ekle
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                paddingRight: '0.5rem'
            }}>
                {notes.length === 0 && !isAdding && (
                    <div style={{ color: '#666', textAlign: 'center', marginTop: '2rem', fontStyle: 'italic' }}>
                        Henüz not yok.
                    </div>
                )}

                {notes.map(note => (
                    <div key={note.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        transition: 'border-color 0.2s',
                        position: 'relative',
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            {note.title && <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{note.title}</h4>}
                            <button
                                onClick={() => handleDeleteNote(note.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    marginLeft: 'auto'
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                            {note.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
