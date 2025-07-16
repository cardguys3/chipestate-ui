// File: /app/votes/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";

export default function VotePage() {
  const { id } = useParams();
  const [vote, setVote] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchVote();
    fetchOptions();
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

  async function submitVote() {
    if (!selectedOption) return;
    await supabase.from("vote_responses").insert({
      vote_id: id,
      option_id: selectedOption,
    });
    setSubmitted(true);
  }

  if (!vote) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <h1 className="text-xl font-bold mb-2">{vote.title}</h1>
        <p className="text-gray-600 mb-1">{vote.description}</p>
        <p className="text-sm mb-4">
          From {vote.start_date} to {vote.end_date}
        </p>

        {submitted ? (
          <Badge variant="success">Thank you for voting!</Badge>
        ) : (
          <div className="space-y-2">
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
    </div>
  );
}
