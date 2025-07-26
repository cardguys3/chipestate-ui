// app/votes/history/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'

export default async function VotingHistoryPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // ❌ Redirect if no user session
  if (!user) {
    redirect('/login')
  }

  // ✅ Query votes for the authenticated user
  const { data: votes, error } = await supabase
    .from('votes')
    .select('id, title, category, created_at, choice')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading voting history:', error)
  }

  return (
    <div className="p-6 bg-[#0B1D33] text-white rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Voting History</h1>
      {votes && votes.length > 0 ? (
        <table className="w-full table-auto text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-gray-600 pb-2">Vote Title</th>
              <th className="border-b border-gray-600 pb-2">Your Choice</th>
              <th className="border-b border-gray-600 pb-2">Category</th>
              <th className="border-b border-gray-600 pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {votes.map(vote => (
              <tr key={vote.id} className="border-b border-gray-700">
                <td className="py-2">{vote.title}</td>
                <td className="py-2">{vote.choice}</td>
                <td className="py-2 capitalize">{vote.category.replace('_', ' ')}</td>
                <td className="py-2">{new Date(vote.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-300">You have not cast any votes yet.</p>
      )}
    </div>
  )
}
