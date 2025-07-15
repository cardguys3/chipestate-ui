// app/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { getProperties } from "@/lib/supabase/queries"; // adjust if using server fetch

export default async function HomePage() {
  const properties = await getProperties();

  return (
    <main className="bg-[#0c1a2c] text-white min-h-screen px-4 sm:px-8 py-8">
      {/* Welcome Banner */}
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Welcome to ChipEstate</h1>
        <p className="text-lg text-gray-300">
          Invest in fractional real estate. Earn rental income. Grow wealth passively.
        </p>
      </section>

      {/* Property Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property: any) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <Card className="hover:shadow-lg bg-[#14273f] cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
              <Image
                src={property.image_url || "/placeholder.jpg"}
                alt={property.title}
                width={500}
                height={300}
                className="rounded-t-2xl w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2">{property.title}</h2>
                <p className="text-sm text-gray-300">{property.city}, {property.state}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
