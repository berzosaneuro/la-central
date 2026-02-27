import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const cloneId = req.nextUrl.searchParams.get('clone_id')

  if (!cloneId) {
    return NextResponse.json({ error: 'Missing clone_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clone_updates')
    .select('*')
    .eq('clone_id', cloneId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clone_id, instance_id, version } = body

  if (!clone_id || !version) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clone_updates')
    .insert({
      clone_id,
      instance_id,
      version,
      status: 'pending',
      progress: 0,
      created_at: new Date().toISOString()
    })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data[0], { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status, progress, error_message } = body

  const { data, error } = await supabase
    .from('clone_updates')
    .update({ status, progress, error_message })
    .eq('id', id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data[0])
}
