// File: /app/votes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/button";

type VoteOption = {
  id: string;
  label: string;
  display_order: number;
};

export default function VoteDetailPage() {
  const { id } = useParams();
  const [vote, setVote] = useState<any>(null);
  const [options, setOptions] = useState<VoteOption[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [tallies, setTallies] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchVote();
    fetchOptions();
    fetchUserVote();
    fetchResults();
  }, [id]);

  async function fetchVote() {
    const { data } = await supabase.from("votes").select("*").eq("id", id).single();
    setVote(data);
  }

  async function fetchOptions() {
    const { data } = await supabase
      .from("vote_options")
      .select("*")
      .eq("vote_id", id)
      .order("display_order");
    setOptions(data || []);
  }

  async function fetchUserVote() {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from("user_votes")
      .select("option_id")
      .eq("vote_id", id)
      .eq("user_id", userId)
      .single();

    setUserVote(data?.option_id || null);
  }

  async function fetchResults() {
    const { data } = await supabase
      .from("user_votes")
      .select("option_id, chips_owned_at_vote")
      .eq("vote_id", id);

    if (!data) return;

    const tally: Record<string, number> = {};
    for (const row of data) {
      tally[row.option_id] = (tally[row.option_id] || 0) + Number(row.chips_owned_at_vote);
    }
    setTallies(tally);
  }

  async function castVote(optionId: string) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return;

    const { data: chips } = await supabase
      .from("chips")
      .select("id")
      .eq("owner_id", userId);

    const chipCount = chips?.length || 0;

    if (chipCount === 0) {
      alert("You must own chips to vote.");
      return;
    }

    await supabase.from("user_votes").upsert({
      vote_id: id,
      option_id: optionId,
      user_id: userId,
      chips_owned_at_vote: chipCount,
    });

    setUserVote(optionId);
    fetchResults();
  }

  if (!vote) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{vote.title}</h1>
      <p className="mb-4 text-gray-600">{vote.description}</p>

      <h2 className="text-lg font-semibold mb-2">Options:</h2>
      <ul className="space-y-2">
        {options.map((opt) => {
          const isSelected = userVote === opt.id;
          const totalVotes = tallies[opt.id] || 0;
          const sumVotes = Object.values(tallies).reduce((a, b) => a + b, 0);
          const percent = sumVotes > 0 ? (totalVotes / sumVotes) * 100 : 0;

          return (
            <li
              key={opt.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{opt.label}</p>
                {!vote.is_open && (
                  <p className="text-sm text-gray-500">
                    {totalVotes} chips ({percent.toFixed(1)}%)
                  </p>
                )}
              </div>
              {vote.is_open && (
                <Button
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => castVote(opt.id)}
                >
                  {isSelected ? "Voted" : "Vote"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {!vote.is_open && (
        <p className="mt-6 text-sm text-gray-600 italic">
          Voting closed. Results above reflect chip-weighted outcomes.
        </p>
      )}
    </div>
  );
}
