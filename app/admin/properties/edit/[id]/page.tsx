"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [form, setForm] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setForm(data);
        if (data.image_path) {
          const { data: publicURL } = supabase.storage
            .from("property-images")
            .getPublicUrl(data.image_path);
          setImageUrl(publicURL?.publicUrl || null);
        }
      }
    };
    fetchProperty();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `${Date.now()}-${file.name}`;
    setLoading(true);
    const { error } = await supabase.storage
      .from("property-images")
      .upload(filePath, file);
    if (!error) {
      setForm((prev: any) => ({ ...prev, image_path: filePath }));
      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);
      setImageUrl(data?.publicUrl || null);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("properties").update(form).eq("id", id);
    setLoading(false);
    router.push("/admin/properties");
  };

  const cancelChanges = () => {
    router.push("/admin/properties");
  };

  if (!form)
    return <p className="text-white bg-gray-900 min-h-screen p-6">Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-3xl border border-gray-700 p-6 rounded-lg"
      >
        <div>
          <label className="block mb-1 font-semibold">
            Title<span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">
            Price<span className="text-red-500">*</span>
          </label>
          <input
            name="price"
            value={form.price || ""}
            onChange={handleChange}
            type="number"
            required
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Number of Chips</label>
          <input
            name="chips"
            value={form.chips || ""}
            onChange={handleChange}
            type="number"
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Upload Property Image</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="file:bg-emerald-600 file:text-white file:px-4 file:py-2 file:rounded hover:file:bg-emerald-700"
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Property"
              className="mt-4 rounded max-w-xs border border-gray-700"
            />
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={cancelChanges}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Cancel Changes
          </button>
        </div>
      </form>
    </main>
  );
}
