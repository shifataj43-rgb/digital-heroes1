'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendWinnerEmail } from '@/lib/email'

export async function checkDrawCompletedThisMonth() {
  const { createClient: createServerClient } = await import('@supabase/supabase-js')
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const d = new Date()
  const { data: existingDraw } = await adminSupabase
    .from('draws')
    .select('id')
    .eq('month', d.getMonth() + 1)
    .eq('year', d.getFullYear())
    .maybeSingle()

  return !!existingDraw
}

export async function runDrawSimulation(logicType: 'random' | 'algorithmic') {
  const { createClient: createServerClient } = await import('@supabase/supabase-js')
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // 1. Get all active subscribers with exactly 5 scores
  // In a real scenario, this would be a complex join. We'll simplify for the simulation.
  const { data: users } = await adminSupabase.from('profiles').select('id, subscription_tier, currency').eq('subscription_status', 'active')
  
  if (!users || users.length === 0) return { error: 'No active subscribers found.' }

  let eligibleUsers: any[] = []
  let allScores: number[] = []
  
  for (const user of users) {
    const { data: scores } = await adminSupabase.from('scores').select('score').eq('user_id', user.id).order('date', { ascending: false }).limit(5)
    if (scores && scores.length === 5) {
      const userNumbers = scores.map(s => s.score)
      eligibleUsers.push({ id: user.id, numbers: userNumbers })
      allScores.push(...userNumbers)
    }
  }

  // Generate 5 numbers based on selected logic
  const winningNumbers: number[] = []
  
  if (logicType === 'algorithmic' && allScores.length > 0) {
    // Algorithmic: Weighted by least frequent user scores (house edge)
    const frequency: Record<number, number> = {}
    for (let i = 1; i <= 45; i++) frequency[i] = 0
    allScores.forEach(s => frequency[s]++)
    
    // Sort numbers by highest frequency
    const sortedByFrequency = Object.entries(frequency).sort((a, b) => b[1] - a[1])
    
    // Pick the 5 most chosen numbers
    for(let i=0; i<5; i++) {
      winningNumbers.push(parseInt(sortedByFrequency[i][0]))
    }
  } else {
    // Standard Random
    while(winningNumbers.length < 5) {
      const r = Math.floor(Math.random() * 45) + 1
      if(winningNumbers.indexOf(r) === -1) winningNumbers.push(r)
    }
  }

  // Calculate matches
  let match5 = 0, match4 = 0, match3 = 0
  
  for (const u of eligibleUsers) {
    let matches = 0
    u.numbers.forEach((n: number) => {
      if (winningNumbers.includes(n)) matches++
    })
    u.matchCount = matches
    if (matches === 5) match5++
    if (matches === 4) match4++
    if (matches === 3) match3++
  }

  // ---------------------------------------------------------
  // Financial calculations (The Core Calculation Pipeline)
  // ---------------------------------------------------------

  // 2. Calculate 30% contribution grouped by currency
  const financialsByCurrency: Record<string, {
    totalSubscriptionRevenue: number,
    totalPrizePool: number,
    match5: number, match4: number, match3: number
  }> = {}

  if (users && users.length > 0) {
    users.forEach((user: any) => {
      const cur = user.currency || 'USD'
      if (!financialsByCurrency[cur]) {
        financialsByCurrency[cur] = { totalSubscriptionRevenue: 0, totalPrizePool: 0, match5: 0, match4: 0, match3: 0 }
      }
      
      const monthlyAmount = user.subscription_tier === 'yearly' ? (cur === 'INR' ? 4999/12 : 99/12) : (cur === 'INR' ? 499 : 9.99)
      financialsByCurrency[cur].totalSubscriptionRevenue += monthlyAmount
      financialsByCurrency[cur].totalPrizePool += monthlyAmount * 0.30 // 30% to prize pool
    })
  }

  // Group winners by currency to divide the prize pool correctly
  for (const u of eligibleUsers) {
    const userProfile = users?.find(p => p.id === u.id)
    const cur = userProfile?.currency || 'USD'
    if (!financialsByCurrency[cur]) {
      financialsByCurrency[cur] = { totalSubscriptionRevenue: 0, totalPrizePool: 0, match5: 0, match4: 0, match3: 0 }
    }
    
    if (u.matchCount === 5) financialsByCurrency[cur].match5++
    if (u.matchCount === 4) financialsByCurrency[cur].match4++
    if (u.matchCount === 3) financialsByCurrency[cur].match3++
    u.currency = cur
  }

  // 3. Prepare structured financials output per currency
  const financials: Record<string, any> = {}

  for (const [cur, stats] of Object.entries(financialsByCurrency)) {
    // Check for previous rollover (simplification: assume 0 for simulation per currency unless queried)
    // We would need to query rollover by currency from prize_pool. For now we just query the latest.
    const { data: lastPool } = await adminSupabase
      .from('prize_pool')
      .select('rollover_amount')
      .eq('currency', cur)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const previousRollover = lastPool ? Number(lastPool.rollover_amount) : 0
    
    const fiveMatchBase = stats.totalPrizePool * 0.40
    const fiveMatchTotal = fiveMatchBase + previousRollover
    const fourMatchTotal = stats.totalPrizePool * 0.35
    const threeMatchTotal = stats.totalPrizePool * 0.25

    financials[cur] = {
      totalSubscriptionRevenue: stats.totalSubscriptionRevenue,
      totalPool: stats.totalPrizePool,
      previousRollover,
      match5: { 
        percentage: 40, 
        baseAmount: fiveMatchBase,
        total: fiveMatchTotal, 
        perWinner: stats.match5 > 0 ? fiveMatchTotal / stats.match5 : 0 
      },
      match4: { 
        percentage: 35, 
        total: fourMatchTotal, 
        perWinner: stats.match4 > 0 ? fourMatchTotal / stats.match4 : 0 
      },
      match3: { 
        percentage: 25, 
        total: threeMatchTotal, 
        perWinner: stats.match3 > 0 ? threeMatchTotal / stats.match3 : 0 
      }
    }
  }

  return {
    success: true,
    simulation: {
      logicType,
      winningNumbers,
      eligiblePlayers: eligibleUsers.length,
      eligibleUsers,
      results: { match5, match4, match3 },
      financials
    }
  }
}

export async function publishDraw(simulationResults: any, rolloverJackpot: boolean) {
  const { createClient: createServerClient } = await import('@supabase/supabase-js')
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const d = new Date()
  
  const currentMonthStr = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`
  const currentMonthNum = d.getMonth() + 1
  const currentYearNum = d.getFullYear()

  // 1. Explicit Validation: Enforce Monthly Cadence exactly once per month
  const { data: existingDraw } = await adminSupabase
    .from('draws')
    .select('id')
    .eq('month', currentMonthNum)
    .eq('year', currentYearNum)
    .maybeSingle()

  if (existingDraw) {
    return { error: 'A draw has already been published for this month. Draws are strictly executed once per month.' }
  }

  let drawId = null

  // Process and save pools per currency
  for (const [cur, fin] of Object.entries(simulationResults.financials)) {
    const finObj = fin as any
    const rolloverAmount = simulationResults.results.match5 === 0 && rolloverJackpot ? finObj.match5.total : 0

    await adminSupabase.from('prize_pool').insert({
      month: currentMonthStr,
      total_amount: finObj.totalPool,
      five_match_amount: finObj.match5.total,
      four_match_amount: finObj.match4.total,
      three_match_amount: finObj.match3.total,
      rollover_amount: rolloverAmount,
      currency: cur
    })

    // Insert Draw (one master draw, but tracking the USD values for backward compatibility)
    if (cur === 'USD' || !drawId) {
      const { data: draw, error: drawErr } = await adminSupabase.from('draws').insert({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        status: 'published',
        winning_numbers: simulationResults.winningNumbers,
        total_prize_pool: finObj.totalPool,
        jackpot_carried_over: rolloverAmount
      }).select().single()

      if (drawErr && drawErr.code === '23505') {
        return { error: 'A draw has already been published for this month and year.' }
      }
      drawId = draw?.id
    }
  }

  // 3. Insert Winners & Payouts
  for (const u of simulationResults.eligibleUsers) {
    // Save entry
    const { data: entry } = await adminSupabase.from('draw_entries').insert({
      draw_id: drawId,
      user_id: u.id,
      numbers: u.numbers,
      match_count: u.matchCount
    }).select().single()

    if (u.matchCount >= 3) {
      let prize = 0
      let matchType = ''
      const finObj = simulationResults.financials[u.currency] as any
      if (u.matchCount === 5) { prize = finObj.match5.perWinner; matchType = '5-match'; }
      if (u.matchCount === 4) { prize = finObj.match4.perWinner; matchType = '4-match'; }
      if (u.matchCount === 3) { prize = finObj.match3.perWinner; matchType = '3-match'; }

      // Insert into new explicit winners table
      await adminSupabase.from('winners').insert({
        user_id: u.id,
        match_type: matchType,
        prize_amount: prize,
        status: 'pending',
        draw_month: currentMonthStr,
        currency: u.currency
      })

      // Also insert into existing winner_verifications (legacy support for the UI view)
      if (entry) {
        await adminSupabase.from('winner_verifications').insert({
          draw_entry_id: entry.id,
          user_id: u.id,
          status: 'pending',
          prize_amount: prize
        })
      }
    }
  }

  // 4. Dispatch real emails to actual winners
  if (simulationResults.results.match5 > 0 || simulationResults.results.match4 > 0 || simulationResults.results.match3 > 0) {
    for (const u of simulationResults.eligibleUsers) {
      if (u.matchCount >= 3) {
        // Fetch the secure email directly from Supabase Auth admin
        const { data: authData } = await adminSupabase.auth.admin.getUserById(u.id)
        const userEmail = authData?.user?.email

        if (userEmail) {
          const { data: userProfile } = await adminSupabase.from('profiles').select('full_name').eq('id', u.id).maybeSingle()
          const name = userProfile?.full_name || 'Valued Subscriber'
          
          let prize = 0
          const finObj = simulationResults.financials[u.currency] as any
          if (u.matchCount === 5) prize = finObj.match5.perWinner
          if (u.matchCount === 4) prize = finObj.match4.perWinner
          if (u.matchCount === 3) prize = finObj.match3.perWinner
          
          const symbol = u.currency === 'INR' ? '₹' : '$'
          
          await sendWinnerEmail(userEmail, name, `${symbol}${prize.toFixed(2)}`)
        }
      }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/winners')

  return { success: true }
}
