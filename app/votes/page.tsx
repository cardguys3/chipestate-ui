// File: /app/votes/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VotesPage() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    fetchVotes();
  }, []);

  async function fetchVotes() {
    const { data } = await supabase
      .from("votes")
      .select("id, title, category, start_date, end_date, is_open")
      .order("start_date", { ascending: false });

    setVotes(data || []);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Community Votes</h1>
      <ul className="space-y-4">
        {votes.map(vote => (
          <li key={vote.id} className="border p-4 rounded-xl">
            <Link href={`/votes/${vote.id}`} className="text-blue-500 font-semibold hover:underline">
              {vote.title}
            </Link>
            <p className="text-sm text-gray-600">{vote.category} | {vote.is_open ? "Open" : "Closed"}</p>
            <p className="text-xs text-gray-500">{vote.start_date?.slice(0, 10)} – {vote.end_date?.slice(0, 10)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}