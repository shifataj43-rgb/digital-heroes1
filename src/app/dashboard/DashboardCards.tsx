'use client'

import { motion } from 'framer-motion'
import { Calendar, Gift, Trophy, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardCards({ 
  drawsEntered, 
  upcomingDrawDate, 
  scores, 
  totalWon, 
  paymentStatus, 
  profile 
}: any) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Participation Summary */}
      <motion.div variants={item} className="glass-card p-8 rounded-3xl glass-card-hover group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <h2 className="text-2xl font-light tracking-tight flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          Participation Summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
            <div className="text-zinc-400 text-sm mb-1">Draws Entered</div>
            <div className="text-2xl font-medium">{drawsEntered}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
            <div className="text-zinc-400 text-sm mb-1">Upcoming Draw</div>
            <div className="text-lg font-medium text-teal-300" suppressHydrationWarning>{upcomingDrawDate.toLocaleDateString()}</div>
          </div>
        </div>
        {scores && scores.length < 5 && (
          <p className="text-sm text-amber-400 mt-4 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">
            ⚠️ You need {5 - scores.length} more scores to be eligible for the upcoming draw!
          </p>
        )}
      </motion.div>

      {/* Winnings Overview */}
      <motion.div variants={item} className="glass-card p-8 rounded-3xl glass-card-hover group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <h2 className="text-2xl font-light tracking-tight flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Gift className="w-5 h-5 text-amber-400" />
          </div>
          Winnings Overview
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
            <div className="text-amber-500/80 text-sm mb-1">Total Won</div>
            <div className="text-2xl font-medium text-amber-400">${totalWon.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
            <div className="text-zinc-400 text-sm mb-1">Payout Status</div>
            <div className="text-lg font-medium text-emerald-400">{paymentStatus}</div>
          </div>
        </div>
      </motion.div>

      {/* Scores Card */}
      <motion.div variants={item} className="glass-card p-8 rounded-3xl glass-card-hover group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <Trophy className="w-5 h-5 text-teal-400" />
            </div>
            Recent Scores
          </h2>
          <Link href="/dashboard/scores" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
            Manage <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {scores && scores.length > 0 ? (
          <div className="space-y-3">
            {scores.map((score: any) => (
              <div key={score.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 shadow-inner transition-colors hover:bg-white/10">
                <span className="text-zinc-300" suppressHydrationWarning>{new Date(score.date).toLocaleDateString()}</span>
                <span className="font-medium text-emerald-300">{score.score} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <p>No scores entered yet.</p>
            <p className="text-sm mt-1">Enter your last 5 Stableford scores to play.</p>
          </div>
        )}
      </motion.div>

      {/* Charity Impact Card */}
      <motion.div variants={item} className="glass-card p-8 rounded-3xl glass-card-hover group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            Your Impact
          </h2>
          <Link href="/dashboard/charity" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
            Change <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {profile?.charity_id ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-medium">{profile?.charities?.name}</h3>
            <p className="text-zinc-400 text-sm mt-1">
              You are donating <span className="text-rose-400 font-medium">{profile.charity_percentage}%</span> of your subscription to this cause.
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <p>No charity selected.</p>
            <p className="text-sm mt-1">Choose a cause to support with your membership.</p>
            <Link href="/dashboard/charity" className="inline-block mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all shadow-inner">
              Select Charity
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
