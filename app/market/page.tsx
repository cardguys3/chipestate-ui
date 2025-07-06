'use client'

import Image from 'next/image'

const properties = [
  {
    image: '/property1.jpg',
    addressLine1: '217 W Stone St',
    cityStateZip: 'Gibsonburg, OH 43431',
    price: '$50.00',
    priceChange: '0.00%',
    chart: '',
    reserve: '$0',
    reservePct: '0.0%',
    yield: '11.92%',
    capRate: '11.92%',
    status: 'Rented',
    marketCap: '$117,450',
    tokens: '0/2,349',
    tokensPct: '0.00%',
  },
  {
    image: '/property2.jpg',
    addressLine1: '1935 S Glen Rd',
    cityStateZip: 'Shelby, MI 49455',
    price: '$47.95',
    priceChange: '-2.24%',
    chart: '',
    reserve: '$2,012',
    reservePct: '100.00%',
    yield: '18.23%',
    capRate: '9.93%',
    status: 'Rented',
    marketCap: '$1,324,295',
    tokens: '5,524/27,624',
    tokensPct: '20.00%',
  }
  // Add more properties as needed
]

export default function MarketPage() {
  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Marketplace</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-blue-800 text-gray-300">
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 px-2">Price</th>
                <th className="py-2 px-2">Chart (30D)</th>
                <th className="py-2 px-2">Operating Reserve</th>
                <th className="py-2 px-2">Yield</th>
                <th className="py-2 px-2">Cap Rate</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Market Cap</th>
                <th className="py-2 px-2">Chips Available</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-blue-800 hover:bg-blue-900 transition duration-150"
                >
                  <td className="flex items-center gap-3 py-3 pr-4">
                    <Image
                      src={p.image}
                      alt={p.addressLine1}
                      width={60}
                      height={60}
                      className="rounded-md object-cover w-16 h-16"
                    />
                    <div>
                      <div className="font-semibold">{p.addressLine1}</div>
                      <div className="text-gray-400 text-xs">{p.cityStateZip}</div>
                    </div>
                  </td>
                  <td className="px-2">{p.price}</td>
                  <td className="px-2">{p.priceChange}</td>
                  <td className="px-2">{p.reserve} <span className="text-gray-400 text-xs">({p.reservePct})</span></td>
                  <td className="px-2">{p.yield}</td>
                  <td className="px-2">{p.capRate}</td>
                  <td className="px-2">
                    <span className="bg-purple-700 text-xs px-2 py-1 rounded-full text-white">{p.status}</span>
                  </td>
                  <td className="px-2">{p.marketCap}</td>
                  <td className="px-2">{p.tokens} <span className="text-gray-400 text-xs">({p.tokensPct})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
