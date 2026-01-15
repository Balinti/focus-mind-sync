import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({
        subscribed: false,
        status: null,
        message: 'Database not configured',
      })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        subscribed: false,
        status: null,
      })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({
        subscribed: false,
        status: null,
      })
    }

    const isActive = ['active', 'trialing'].includes(subscription.status)

    return NextResponse.json({
      subscribed: isActive,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json({
      subscribed: false,
      status: null,
      error: 'Failed to check subscription',
    })
  }
}
