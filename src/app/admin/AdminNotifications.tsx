'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'

export type NotificationType = {
  id: string
  title: string
  message: string
  time: string
  type: 'user' | 'alert' | 'success'
  read: boolean
}

export default function AdminNotifications({ initialNotifications }: { initialNotifications: NotificationType[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'user': return <UserPlus className="w-4 h-4 text-emerald-400" />
      case 'alert': return <AlertCircle className="w-4 h-4 text-amber-400" />
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      default: return <Bell className="w-4 h-4 text-zinc-400" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-zinc-900"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm">
            <h3 className="font-medium text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex gap-4 ${!notification.read ? 'bg-emerald-500/[0.03]' : ''}`}
                    onClick={() => {
                      setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n))
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      notification.type === 'user' ? 'bg-emerald-500/10' : 
                      notification.type === 'alert' ? 'bg-amber-500/10' : 
                      'bg-emerald-500/10'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!notification.read ? 'text-white' : 'text-zinc-300'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                No new notifications
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/5 text-center bg-zinc-900/80 backdrop-blur-sm">
            <button className="text-xs text-zinc-400 hover:text-white transition-colors">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
