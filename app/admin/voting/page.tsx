// File: /app/admin/voting/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminVotingPage() {
  const [votes, setVotes] = useState([]);
  const [newVote, setNewVote] = useState({
    title: "",
    description: "",
    category: "",
    threshold_type: "simple",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    fetchVotes();
  }, []);

  async function fetchVotes() {
    const { data, error } = await supabase
      .from("votes")
      .select("id, title, category, is_open, start_date, end_date")
      .order("created_at", { ascending: false });
    if (!error) setVotes(data);
  }

  async function createVote() {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.data.session?.user?.id;

    const { data, error } = await supabase.from("votes").insert({
      ...newVote,
      created_by: userId
    });
    if (!error) {
      setNewVote({ title: "", description: "", category: "", threshold_type: "simple", start_date: "", end_date: "" });
      fetchVotes();
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Votes</h1>

      <div className="space-y-4 border border-gray-300 rounded-xl p-4 mb-8">
        <h2 className="text-xl font-semibold">Create New Vote</h2>

        <div>
          <Label>Title</Label>
          <Input value={newVote.title} onChange={e => setNewVote({ ...newVote, title: e.target.value })} />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={newVote.description} onChange={e => setNewVote({ ...newVote, description: e.target.value })} />
        </div>

        <div>
          <Label>Category</Label>
          <Input value={newVote.category} onChange={e => setNewVote({ ...newVote, category: e.target.value })} />
        </div>

        <div>
          <Label>Threshold Type</Label>
          <select
            className="w-full border rounded-md p-2"
            value={newVote.threshold_type}
            onChange={e => setNewVote({ ...newVote, threshold_type: e.target.value })}
          >
            <option value="simple">Simple Majority</option>
            <option value="super_60">Supermajority 60%</option>
            <option value="super_67">Supermajority 66.7%</option>
            <option value="minority_veto">Minority Veto</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input type="datetime-local" value={newVote.start_date} onChange={e => setNewVote({ ...newVote, start_date: e.target.value })} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="datetime-local" value={newVote.end_date} onChange={e => setNewVote({ ...newVote, end_date: e.target.value })} />
          </div>
        </div>

        <Button className="mt-4" onClick={createVote}>Create Vote</Button>
      </div>

      <h2 className="text-xl font-semibold mb-2">All Votes</h2>
      <ul className="space-y-3">
        {votes.map(vote => (
          <li key={vote.id} className="border p-4 rounded-lg">
            <Link href={`/admin/voting/${vote.id}`} className="text-blue-500 hover:underline font-semibold">
              {vote.title}
            </Link>
            <p className="text-sm text-gray-500">{vote.category} – {vote.is_open ? "Open" : "Closed"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}