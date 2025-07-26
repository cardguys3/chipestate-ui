// /app/votes/history/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function VoteHistoryPage() {
  const supabase = createClientComponentClient<Database>()
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchVotes = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('user_votes')
        .select(`
          id,
          voted_at,
          vote_id,
          votes (
            title,
            category,
            start_date
          ),
          vote_options (
            label
          )
        `)
        .eq('user_id', user.id)
        .order('voted_at', { ascending: false })

      if (error) {
        toast.error('Failed to load vote history')
        console.error(error)
      } else {
        setVotes(data)
      }

      setLoading(false)
    }

    fetchVotes()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📜 Your Voting History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : votes.length === 0 ? (
        <p className="text-gray-400">You haven't voted on any proposals yet.</p>
      ) : (
        <table className="min-w-full text-sm border border-white/10 bg-white/5 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#132132] text-white/80">
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Your Vote</th>
              <th className="text-left px-4 py-2">Voted At</th>
            </tr>
          </thead>
          <tbody>
            {votes.map(vote => (
              <tr key={vote.id} className="border-t border-white/10">
                <td className="px-4 py-2">{vote.votes.title}</td>
                <td className="px-4 py-2 capitalize">{vote.votes.category.replace('_', ' ')}</td>
                <td className="px-4 py-2">{vote.vote_options.label}</td>
                <td className="px-4 py-2">{new Date(vote.voted_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
