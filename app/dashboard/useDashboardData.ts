// /app/dashboard/hooks/useDashboardData.ts

'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function useDashboardData() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('❌ Failed to get user:', userError)
    return {
      user: null,
      firstName: '',
      chips: [],
      properties: [],
      earnings: [],
      badges: [],
      totalPayout: 0,
      totalEarnings: 0,
      netWorth: 0,
      registrationStatus: null,
    }
  }

  const userId = user.id

  const [{ data: chips = [] }, { data: properties = [] }, { data: earnings = [] }, { data: badges = [] }] = await Promise.all([
    supabase.from('chips').select('*').eq('user_id', userId),
    supabase.from('properties').select('*'),
    supabase.from('chip_earnings').select('*').eq('user_id', userId),
    supabase.from('badge_activity_log')
      .select(`
        id,
        badge_key,
        awarded_at,
        badges_catalog ( name, icon )
      `)
      .eq('user_id', userId),
  ])

  const firstName = user.user_metadata?.first_name || ''
  const registrationStatus = user.user_metadata?.registration_status || null

  const totalPayout = earnings
    .filter(e => e.type === 'distribution')
    .reduce((sum, e) => sum + (e.amount || 0), 0)

  const totalEarnings = earnings.reduce((sum, e) => sum + (e.amount || 0), 0)

  const netWorth = totalPayout + (chips.length * 50)

  return {
    user,
    firstName,
    chips,
    properties,
    earnings,
    badges,
    totalPayout,
    totalEarnings,
    netWorth,
    registrationStatus,
  }
}
