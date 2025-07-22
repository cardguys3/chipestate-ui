"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/button";
import Input from "@/components/input";
import Textarea from "@/components/textarea";
import Label from "@/components/label";

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
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-white">Manage Votes</h1>

      {/* New Vote Form */}
      <section className="bg-[#0B1D33] p-4 rounded-xl border border-gray-600 mb-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Create New Vote</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={newVote.title}
              onChange={e => setNewVote({ ...newVote, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Category</Label>
            <select
              className="w-full border rounded-md p-2 bg-white text-black"
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
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={newVote.description}
              onChange={e => setNewVote({ ...newVote, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Threshold Type</Label>
            <select
              className="w-full border rounded-md p-2 bg-white text-black"
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
              className="w-full border rounded-md p-2 bg-white text-black"
              value={newVote.property_id}
              onChange={e => setNewVote({ ...newVote, property_id: e.target.value })}
            >
              <option value="">-- Select Property --</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

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

        <div className="mt-4">
          <Button onClick={createVote}>Create Vote</Button>
        </div>
      </section>

      {/* Vote List */}
      <section className="bg-white p-4 rounded-xl border border-gray-300">
        <h2 className="text-2xl font-semibold mb-4 text-black">All Votes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
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
                <tr key={vote.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2">{vote.title}</td>
                  <td className="px-3 py-2">{vote.category}</td>
                  <td className="px-3 py-2">{new Date(vote.start_date).toLocaleString()}</td>
                  <td className="px-3 py-2">{new Date(vote.end_date).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    {vote.is_open ? (
                      <span className="text-green-600 font-medium">Open</span>
                    ) : (
                      <span className="text-gray-500">Closed</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/voting/${vote.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
