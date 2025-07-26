// File: /app/admin/voting/[id]/page.tsx

'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { cn } from '@/lib/utils'

// Custom admin badge styling
function Badge({
  children,
  variant = 'default',
  className,
  ...props
}: {
  children: React.ReactNode
  variant?: 'success' | 'default' | 'warning' | 'error'
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const variantClasses = {
    success: 'bg-green-200 text-green-900',
    warning: 'bg-yellow-200 text-yellow-900',
    error: 'bg-red-200 text-red-900',
    default: 'bg-gray-200 text-gray-900',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default function VotePage() {
  const { id } = useParams()
  const [vote, setVote] = useState<any>(null)
  const [options, setOptions] = useState<any[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [closingReason, setClosingReason] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    fetchVote()
    fetchOptions()
  }, [id])

  async function fetchVote() {
    const { data } = await supabase.from('votes').select('*').eq('id', id).single()
    setVote(data)
  }

  async function fetchOptions() {
    const { data } = await supabase
      .from('vote_options')
      .select('*')
      .eq('vote_id', id)
      .order('display_order')
    setOptions(data || [])
  }

  async function submitVote() {
    if (!selectedOption) return
    await supabase.from('vote_responses').insert({
      vote_id: id,
      option_id: selectedOption,
    })
    setSubmitted(true)
  }

  async function closeVoteEarly() {
    setIsClosing(true)
    await supabase
      .from('votes')
      .update({ is_closed: true, closed_early_reason: closingReason })
      .eq('id', id)
    await fetchVote()
    setIsClosing(false)
  }

  if (!vote) return <div className="p-6 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0B1D33] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="bg-white text-black p-6">
          <h1 className="text-2xl font-bold mb-2">{vote.title}</h1>
          <p className="mb-1">{vote.description}</p>
          <p className="text-sm mb-4 text-gray-700">
            From {vote.start_date} to {vote.end_date}
          </p>

          {vote.is_closed ? (
            <>
              <Badge variant="error" className="mb-2">Voting Closed</Badge>
              {vote.closed_early_reason && (
                <p className="text-sm mt-2 text-red-700">
                  Closed Early Reason: {vote.closed_early_reason}
                </p>
              )}
            </>
          ) : submitted ? (
            <Badge variant="success">Thank you for voting!</Badge>
          ) : (
            <div className="space-y-4">
              {options.map((opt) => (
                <label key={opt.id} className="block">
                  <input
                    type="radio"
                    name="voteOption"
                    value={opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                    className="mr-2"
                  />
                  {opt.label}
                </label>
              ))}
              <Button onClick={submitVote} disabled={!selectedOption}>
                Submit Vote
              </Button>
            </div>
          )}
        </Card>

        {/* Admin Close Voting Panel */}
        {!vote.is_closed && (
          <Card className="bg-white text-black p-6">
            <h2 className="text-lg font-bold mb-4">Admin Controls</h2>
            <p className="mb-2 text-sm text-gray-700">
              Close this vote early. Be sure to document why you're closing it.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded p-2 text-sm"
              rows={3}
              placeholder="Reason for early closure"
              value={closingReason}
              onChange={(e) => setClosingReason(e.target.value)}
            />
            <div className="mt-4">
              <Button onClick={closeVoteEarly} disabled={!closingReason || isClosing}>
                {isClosing ? 'Closing...' : 'Close Vote Early'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

