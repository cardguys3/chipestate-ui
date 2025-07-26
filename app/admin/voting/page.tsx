// app/admin/voting/page.tsx

'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Textarea } from "@/components/textarea"
import { Label } from "@/components/label"

export default function AdminVotingPage() {
  const [votes, setVotes] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [newVote, setNewVote] = useState({
    title: "",
    description: "",
    category: "",
    threshold_type: "simple",
    start_date: "",
    end_date: "",
    property_id: ""
  })

  useEffect(() => {
    fetchVotes()
    fetchProperties()
    setDefaultDates()
  }, [])

  async function fetchVotes() {
    const { data, error } = await supabase
      .from("votes")
      .select("id, title, category, is_open, start_date, end_date")
      .order("created_at", { ascending: false })
    if (!error) setVotes(data)
  }

  async function fetchProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("id, title")
      .order("title")
    if (!error) setProperties(data)
  }

  function setDefaultDates() {
    const now = new Date()
    const in7Days = new Date()
    in7Days.setDate(now.getDate() + 7)
    setNewVote(v => ({
      ...v,
      start_date: now.toISOString().slice(0, 16),
      end_date: in7Days.toISOString().slice(0, 16)
    }))
  }

  async function createVote() {
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !data?.session?.user) {
      console.error("No authenticated user found.")
      return
    }

    const userId = data.session.user.id
    const { title, threshold_type, start_date, end_date, property_id } = newVote

    if (!title || !threshold_type || !start_date || !end_date || !property_id) {
      alert("Please fill in all required fields including property.")
      return
    }

    const { error } = await supabase.from("votes").insert({
      ...newVote,
      created_by: userId
    })

    if (!error) {
      setNewVote({
        title: "",
        description: "",
        category: "",
        threshold_type: "simple",
        start_date: "",
        end_date: "",
        property_id: ""
      })
      fetchVotes()
      setDefaultDates()
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1f36] text-white px-4 py-8 md:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold">🗳️ Voting Admin Panel</h1>

			{/* Create Vote Section */}
			<section className="border border-white/20 rounded-lg p-6 space-y-4 mb-10">
	  <h2 className="text-lg font-semibold">Create New Vote</h2>

	  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
		<input
		  type="text"
		  placeholder="Title"
		  className="p-2 rounded bg-white/10 text-white border border-white/20"
		  value={newVote.title}
		  onChange={e => setNewVote({ ...newVote, title: e.target.value })}
		/>

		<select
		  className="w-full px-3 py-2 bg-[#1E2A3C] border border-gray-600 text-white rounded"
		  value={newVote.category}
		  onChange={e => setNewVote({ ...newVote, category: e.target.value })}
		>
		  <option value="">-- Select Category --</option>
		  <option value="lease_renewal">Lease Renewal</option>
		  <option value="manager_change">Property Manager Change</option>
		  <option value="reserve_policy">Reserve Policy</option>
		  <option value="capital_improvements">Capital Improvements</option>
		  <option value="distribution_policy">Distribution Policy</option>
		  <option value="property_sale">Property Sale</option>
		  <option value="governance_change">Governance Changes</option>
		  <option value="general_feedback">General Feedback</option>
		</select>

		<select
		  className="w-full px-3 py-2 bg-[#1E2A3C] border border-gray-600 text-white rounded"
		  value={newVote.threshold_type}
		  onChange={e => setNewVote({ ...newVote, threshold_type: e.target.value })}
		>
		  <option value="simple">Simple Majority</option>
		  <option value="super_60">Supermajority 60%</option>
		  <option value="super_67">Supermajority 66.7%</option>
		  <option value="minority_veto">Minority Veto</option>
		</select>

		<select
		  className="p-2 rounded bg-white/10 text-white border border-white/20"
		  value={newVote.property_id}
		  onChange={e => setNewVote({ ...newVote, property_id: e.target.value })}
		>
		  <option value="">-- Select Property --</option>
		  {properties.map(p => (
			<option key={p.id} value={p.id}>{p.title}</option>
		  ))}
		</select>

		<input
		  type="datetime-local"
		  className="w-full px-3 py-2 bg-[#1E2A3C] border border-gray-600 text-white rounded"
		  value={newVote.start_date}
		  onChange={e => setNewVote({ ...newVote, start_date: e.target.value })}
		/>

		<input
		  type="datetime-local"
		  className="p-2 rounded bg-white/10 text-white border border-white/20"
		  value={newVote.end_date}
		  onChange={e => setNewVote({ ...newVote, end_date: e.target.value })}
		/>
	  </div>

	  <textarea
		placeholder="Description"
		className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
		value={newVote.description}
		onChange={e => setNewVote({ ...newVote, description: e.target.value })}
	  />

	  <button
		onClick={createVote}
		className="mt-2 px-4 py-2 bg-emerald-500 rounded hover:bg-emerald-600"
	  >
		Create Vote
	  </button>
	</section>


        {/* Vote List Section */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">All Votes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10 text-white">
                <tr>
                  <th className="text-left px-3 py-2">Title</th>
                  <th className="text-left px-3 py-2">Category</th>
                  <th className="text-left px-3 py-2">Start</th>
                  <th className="text-left px-3 py-2">End</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {votes.map(vote => (
                  <tr key={vote.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2">{vote.title}</td>
                    <td className="px-3 py-2">{vote.category}</td>
                    <td className="px-3 py-2">{new Date(vote.start_date).toLocaleString()}</td>
                    <td className="px-3 py-2">{new Date(vote.end_date).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {vote.is_open ? (
                        <span className="text-green-400 font-semibold">Open</span>
                      ) : (
                        <span className="text-red-400 font-semibold">Closed</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/voting/${vote.id}`} className="text-blue-400 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
