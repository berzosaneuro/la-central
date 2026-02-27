import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const instanceId = req.nextUrl.searchParams.get('instance_id')

  if (!instanceId) {
    return NextResponse.json({ error: 'Missing instance_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('instance_configs')
    .select('*')
    .eq('instance_id', instanceId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { instance_id, config_key, config_value } = body

  if (!instance_id || !config_key) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('instance_configs')
    .upsert({
      instance_id,
      config_key,
      config_value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'instance_id,config_key' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data[0], { status: 201 })
}
