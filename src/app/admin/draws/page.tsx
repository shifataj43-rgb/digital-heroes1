'use client'

import { useState, useEffect } from 'react'
import { runDrawSimulation, publishDraw, checkDrawCompletedThisMonth } from './actions'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

export default function DrawsPage() {
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [logic, setLogic] = useState<'random' | 'algorithmic'>('random')
  const [rollover, setRollover] = useState(true)
  const [isDrawCompleted, setIsDrawCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    checkDrawCompletedThisMonth().then(setIsDrawCompleted)
  }, [])

  const handleSimulate = async () => {
    setLoading(true)
    const res = await runDrawSimulation(logic)
    if (res.simulation) {
      setResults(res.simulation)
      toast.success(`Simulation complete using ${logic} logic.`)
    } else if (res.error) {
      toast.error(res.error)
    }
    setLoading(false)
  }

  const handlePublish = async () => {
    setPublishing(true)
    const res = await publishDraw(results, rollover)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Draw officially published! Results pushed to database.")
      setResults(null) // Reset after publish
      setIsDrawCompleted(true) // Immediately update UI
    }
    setPublishing(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight">Draw Management Engine</h1>
        <p className="text-zinc-400 mt-2">Simulate and execute the monthly draws.</p>
      </div>

      {isDrawCompleted && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>Draw Completed for {new Date().toLocaleString('default', { month: 'long' })}.</strong> The official results have already been published. You may still run simulations for testing purposes, but publishing is disabled until next month.
          </p>
        </div>
      )}

      {isDrawCompleted !== null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl shadow-xl h-fit">
            <h2 className="text-2xl font-light tracking-tight mb-4">Run Simulation</h2>
            <p className="text-sm text-zinc-400 mb-6">Test the draw algorithm against currently eligible active subscribers before publishing official results.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">Draw Logic Option</label>
                <select 
                  value={logic}
                  onChange={(e) => setLogic(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="random">True Random</option>
                  <option value="algorithmic">Algorithmic (Weighted by most frequent user scores)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <input 
                  type="checkbox" 
                  id="rollover" 
                  checked={rollover}
                  onChange={(e) => setRollover(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded border-white/20 bg-white/5"
                />
                <label htmlFor="rollover" className="text-sm">Rollover jackpot to next month if no 5-match winner</label>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={loading || publishing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? 'Running Simulation...' : 'Run Analysis'}
            </button>
          </div>

          {results && (
            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.15)] text-emerald-500">
              <h2 className="text-2xl font-light tracking-tight mb-6">Simulation Results</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1 opacity-70">Winning Numbers</div>
                  <div className="flex gap-2">
                    {results.winningNumbers.map((n: number, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-emerald-500/20 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-70">Eligible Players</div>
                    <div className="text-2xl font-medium">{results.eligiblePlayers}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-emerald-500/20 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-70">5 Matches</div>
                    <div className="text-2xl font-medium">{results.results.match5}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-70">4 Matches</div>
                    <div className="text-2xl font-medium">{results.results.match4}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-70">3 Matches</div>
                    <div className="text-2xl font-medium">{results.results.match3}</div>
                  </div>
                </div>
                
                {/* Detailed Financial Calculations per Currency */}
                <div className="mt-8 space-y-8">
                  {Object.entries(results.financials).map(([cur, fin]: [string, any]) => {
                    const symbol = cur === 'INR' ? '₹' : '$'
                    return (
                      <div key={cur} className="bg-zinc-950/40 p-5 rounded-2xl border border-white/5">
                        <h4 className="font-medium text-emerald-400 border-b border-emerald-500/20 pb-2 mb-4">
                          {cur} Prize Pool Breakdown
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Total Subscription Revenue</span>
                            <span className="font-medium text-zinc-200">{symbol}{fin.totalSubscriptionRevenue?.toFixed(2) || '0.00'}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Prize Pool Contribution (30%)</span>
                            <span className="font-medium text-emerald-400">{symbol}{fin.totalPool.toFixed(2)}</span>
                          </div>

                          {fin.previousRollover > 0 && (
                            <div className="flex justify-between items-center text-sm bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                              <span className="text-emerald-400 font-medium">+ Previous Jackpot Rollover</span>
                              <span className="font-bold text-emerald-400">{symbol}{fin.previousRollover.toFixed(2)}</span>
                            </div>
                          )}

                          <h4 className="font-medium text-zinc-300 border-b border-white/10 pb-2 pt-4">Prize Tier Split</h4>

                          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-emerald-400 text-sm font-medium">5-Match Jackpot (40%)</span>
                              <span className="text-emerald-400 font-medium">
                                {symbol}{fin.match5.total.toFixed(2)}
                                {results.results.match5 === 0 && <span className="text-xs ml-2 opacity-75">(Rollover)</span>}
                              </span>
                            </div>
                            {fin.previousRollover > 0 && (
                              <div className="text-xs text-emerald-500/70 mt-1">
                                (Base {symbol}{fin.match5.baseAmount?.toFixed(2) || '0.00'} + Rollover {symbol}{fin.previousRollover.toFixed(2)})
                              </div>
                            )}
                            {results.results.match5 > 0 && (
                              <div className="text-xs text-emerald-500 mt-1">
                                Winners — {symbol}{fin.match5.perWinner.toFixed(2)} each
                              </div>
                            )}
                          </div>

                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-300 text-sm">4-Match (35%)</span>
                              <span className="text-emerald-400 font-medium">{symbol}{fin.match4.total.toFixed(2)}</span>
                            </div>
                            {results.results.match4 > 0 && (
                              <div className="text-xs text-zinc-500 mt-1">
                                Winners — {symbol}{fin.match4.perWinner.toFixed(2)} each
                              </div>
                            )}
                          </div>

                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-300 text-sm">3-Match (25%)</span>
                              <span className="text-emerald-400 font-medium">{symbol}{fin.match3.total.toFixed(2)}</span>
                            </div>
                            {results.results.match3 > 0 && (
                              <div className="text-xs text-zinc-500 mt-1">
                                Winners — {symbol}{fin.match3.perWinner.toFixed(2)} each
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-emerald-500/20">
                  {isDrawCompleted ? (
                    <div className="text-center text-sm text-emerald-500/70 py-2 border border-emerald-500/20 rounded-lg bg-emerald-500/5">
                      Publishing disabled (Draw already completed for this month)
                    </div>
                  ) : (
                    <button 
                      onClick={handlePublish}
                      disabled={publishing}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-bold py-3 rounded-lg transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      {publishing ? 'Publishing...' : 'Publish Official Results'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-zinc-500">Checking draw status...</div>
        </div>
      )}
    </div>
  )
}
