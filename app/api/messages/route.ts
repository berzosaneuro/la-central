import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const cloneId = req.nextUrl.searchParams.get('to_clone_id')
  
  if (!cloneId) {
    return NextResponse.json({ error: 'Missing to_clone_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('to_clone_id', cloneId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { from_clone_id, to_clone_id, from_instance_id, to_instance_id, subject, body: messageBody } = body

  if (!from_clone_id || !to_clone_id || !subject || !messageBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      from_clone_id,
      to_clone_id,
      from_instance_id,
      to_instance_id,
      subject,
      body: messageBody,
      read: false,
      created_at: new Date().toISOString()
    })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data[0], { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, read } = body

  const { data, error } = await supabase
    .from('messages')
    .update({ read })
    .eq('id', id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data[0])
}
