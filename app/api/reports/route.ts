import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const cloneId = req.nextUrl.searchParams.get('clone_id')
  const reportType = req.nextUrl.searchParams.get('type')

  let query = supabase.from('reports').select('*')

  if (cloneId) query = query.eq('clone_id', cloneId)
  if (reportType) query = query.eq('report_type', reportType)

  const { data, error } = await query.order('generated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clone_id, instance_id, report_type, title, data } = body

  if (!clone_id || !report_type || !title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      clone_id,
      instance_id,
      report_type,
      title,
      data,
      generated_at: new Date().toISOString(),
      status: 'ready'
    })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(report[0], { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { id } = body

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
