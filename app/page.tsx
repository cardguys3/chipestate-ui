'use client'

import PropertyCard from '@/components/PropertyCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="mt-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
          Welcome to ChipEstate
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Buy and sell fractional real estate shares — one chip at a time. Explore real properties, track your earnings, and build your real estate portfolio from the ground up.
        </p>
      </section>

      <section className="mt-16 px-4">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Highlighted Properties</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          <PropertyCard
            image="/property1.jpg"
            addressLine1="123 Oakwood Dr"
            cityStateZip="Dallas, TX 75201"
            rentalReturn="6.2%"
            projectedReturn="8.4%"
            chipsAvailable={42}
            chipsSold={58}
            chipPrice="$52.35"
            isOccupied={true}
            type="residential"
            subType="single_family"
          />
          <PropertyCard
            image="/property2.jpg"
            addressLine1="456 Main St"
            cityStateZip="Fort Worth, TX 76104"
            rentalReturn="5.8%"
            projectedReturn="7.1%"
            chipsAvailable={28}
            chipsSold={12}
            chipPrice="$48.00"
            isOccupied={false}
            type="residential"
            subType="single_family"
          />
        </div>
      </section>

      <Footer />
      <ChatBubble />
    </main>
  )
}
