// File: /app/admin/voting/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VoteDetailPage() {
  const { id } = useParams();
  const [vote, setVote] = useState(null);
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    fetchVote();
    fetchOptions();
  }, [id]);

  async function fetchVote() {
    const { data } = await supabase.from("votes").select("*").eq("id", id).single();
    setVote(data);
  }

  async function fetchOptions() {
    const { data } = await supabase.from("vote_options").select("*").eq("vote_id", id).order("display_order");
    setOptions(data || []);
  }

  async function addOption() {
    await supabase.from("vote_options").insert({ vote_id: id, label: newOption, display_order: options.length + 1 });
    setNewOption("");
    fetchOptions();
  }

  async function closeVote() {
    await supabase.from("votes").update({ is_open: false }).eq("id", id);
    fetchVote();
  }

  if (!vote) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{vote.title}</h1>
      <p className="mb-2 text-gray-600">{vote.description}</p>
      <p className="text-sm">Start: {vote.start_date} | End: {vote.end_date}</p>
      <p className="text-sm mb-4">Status: {vote.is_open ? "Open" : "Closed"}</p>

      {vote.is_open && (
        <Button variant="destructive" onClick={closeVote} className="mb-6">Close Vote</Button>
      )}

      <h2 className="text-lg font-semibold mb-2">Vote Options</h2>
      <ul className="list-disc pl-6 mb-4">
        {options.map(opt => (
          <li key={opt.id}>{opt.label}</li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Input
          placeholder="Add new option"
          value={newOption}
          onChange={e => setNewOption(e.target.value)}
        />
        <Button onClick={addOption}>Add Option</Button>
      </div>
    </div>
  );
}
