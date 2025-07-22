// app/admin/voting
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Label } from "@/components/label";

export default function AdminVotingPage() {
  const [votes, setVotes] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [newVote, setNewVote] = useState({
    title: "",
    description: "",
    category: "",
    threshold_type: "simple",
    start_date: "",
    end_date: "",
    property_id: ""
  });

  useEffect(() => {
    fetchVotes();
    fetchProperties();
    setDefaultDates();
  }, []);

  async function fetchVotes() {
    const { data, error } = await supabase
      .from("votes")
      .select("id, title, category, is_open, start_date, end_date")
      .order("created_at", { ascending: false });
    if (!error) setVotes(data);
  }

  async function fetchProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("id, title")
      .order("title");
    if (!error) setProperties(data);
  }

  function setDefaultDates() {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);
    setNewVote(v => ({
      ...v,
      start_date: now.toISOString().slice(0, 16),
      end_date: in7Days.toISOString().slice(0, 16)
    }));
  }

  async function createVote() {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data?.session?.user) {
      console.error("No authenticated user found.");
      return;
    }

    const userId = data.session.user.id;
    const { title, threshold_type, start_date, end_date, property_id } = newVote;

    if (!title || !threshold_type || !start_date || !end_date || !property_id) {
      alert("Please fill in all required fields including property.");
      return;
    }

    const { error } = await supabase.from("votes").insert({
      ...newVote,
      created_by: userId
    });

    if (!error) {
      setNewVote({
        title: "",
        description: "",
        category: "",
        threshold_type: "simple",
        start_date: "",
        end_date: "",
        property_id: ""
      });
      fetchVotes();
      setDefaultDates();
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Votes</h1>

      <div className="space-y-4 border border-gray-300 rounded-xl p-4 mb-8 bg-[#0B1D33] text-white">
        <h2 className="text-xl font-semibold">Create New Vote</h2>

        <div>
          <Label>Title</Label>
          <Input
            value={newVote.title}
            onChange={e => setNewVote({ ...newVote, title: e.target.value })}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={newVote.description}
            onChange={e => setNewVote({ ...newVote, description: e.target.value })}
          />
        </div>

        <div>
          <Label>Category</Label>
          <Input
            value={newVote.category}
            onChange={e => setNewVote({ ...newVote, category: e.target.value })}
          />
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

        <div>
          <Label>Property</Label>
          <select
            className="w-full border rounded-md p-2"
            value={newVote.property_id}
            onChange={e => setNewVote({ ...newVote, property_id: e.target.value })}
          >
            <option value="">-- Select Property --</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="datetime-local"
              value={newVote.start_date}
              onChange={e => setNewVote({ ...newVote, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="datetime-local"
              value={newVote.end_date}
              onChange={e => setNewVote({ ...newVote, end_date: e.target.value })}
            />
          </div>
        </div>

        <Button className="mt-4" onClick={createVote}>
          Create Vote
        </Button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">All Votes</h2>
      <ul className="space-y-3">
        {votes.map(vote => (
          <li key={vote.id} className="border p-4 rounded-lg bg-white">
            <Link
              href={`/admin/voting/${vote.id}`}
              className="text-blue-600 hover:underline font-semibold"
            >
              {vote.title}
            </Link>
            <p className="text-sm text-gray-500">
              {vote.category} – {vote.is_open ? "Open" : "Closed"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
