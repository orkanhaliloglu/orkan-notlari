'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Plus, Calendar, CheckCircle2, Circle, Loader2 } from 'lucide-react'

type Reminder = {
    id: string
    title: string
    due_date: string | null
    is_completed: boolean
    created_at: string
}

export default function RemindersManager() {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newReminderTitle, setNewReminderTitle] = useState('')
    const [newReminderDate, setNewReminderDate] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchReminders()

        const subscription = supabase
            .channel('reminders_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => {
                fetchReminders()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const fetchReminders = async () => {
        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .order('is_completed', { ascending: true })
                .order('due_date', { ascending: true })

            if (error) throw error
            setReminders(data || [])
        } catch (error) {
            console.error('Error fetching reminders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddReminder = async () => {
        if (!newReminderTitle.trim()) return

        try {
            const { error } = await supabase
                .from('reminders')
                .insert([{
                    title: newReminderTitle,
                    due_date: newReminderDate || null
                }])

            if (error) throw error

            setNewReminderTitle('')
            setNewReminderDate('')
            setIsAdding(false)
        } catch (error) {
            console.error('Error adding reminder:', error)
        }
    }

    const toggleComplete = async (reminder: Reminder) => {
        try {
            const { error } = await supabase
                .from('reminders')
                .update({ is_completed: !reminder.is_completed })
                .eq('id', reminder.id)

            if (error) throw error
        } catch (error) {
            console.error('Error toggling reminder:', error)
        }
    }

    const handleDeleteReminder = async (id: string) => {
        try {
            const { error } = await supabase
                .from('reminders')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Error deleting reminder:', error)
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
                <h3 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.25rem' }}>HATIRLATICILAR</h3>
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
                        placeholder="Ne yapılması gerekiyor?"
                        value={newReminderTitle}
                        onChange={(e) => setNewReminderTitle(e.target.value)}
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
                        autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                value={newReminderDate}
                                onChange={(e) => setNewReminderDate(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#a1a1aa',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <button
                            onClick={handleAddReminder}
                            style={{
                                background: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                padding: '0.25rem 0.75rem',
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
                gap: '0.75rem',
                paddingRight: '0.5rem'
            }}>
                {reminders.length === 0 && !isAdding && (
                    <div style={{ color: '#666', textAlign: 'center', marginTop: '2rem', fontStyle: 'italic' }}>
                        Hatırlatıcı yok.
                    </div>
                )}

                {reminders.map(reminder => (
                    <div key={reminder.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        opacity: reminder.is_completed ? 0.5 : 1,
                        transition: 'opacity 0.2s',
                        border: '1px solid transparent'
                    }}>
                        <button
                            onClick={() => toggleComplete(reminder)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: reminder.is_completed ? '#4ade80' : 'rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex'
                            }}
                        >
                            {reminder.is_completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                textDecoration: reminder.is_completed ? 'line-through' : 'none',
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                color: reminder.is_completed ? '#666' : '#ededed'
                            }}>
                                {reminder.title}
                            </div>
                            {reminder.due_date && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginTop: '2px'
                                }}>
                                    <Calendar size={10} />
                                    {new Date(reminder.due_date).toLocaleDateString('tr-TR')}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
