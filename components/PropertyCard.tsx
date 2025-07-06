'use client'

import Image from 'next/image'
import { useState } from 'react'
import clsx from 'clsx'

const typeIcons: Record<string, string> = {
  residential: '🏠',
  commercial: '🏢',
  vacation: '🏖️',
}

const subTypeLabels: Record<string, string> = {
  single_family: 'Single Family',
  multi_family: 'Multi-Family',
  office: 'Office Space',
  retail: 'Retail',
  condo: 'Condo',
  townhome: 'Townhome',
  mobile_home: 'Mobile Home',
  industrial: 'Industrial',
  hotel: 'Hotel',
  land: 'Vacant Lot',
}

type PropertyCardProps = {
  image: string
  addressLine1: string
  cityStateZip: string
  rentalReturn: string
  projectedReturn: string
  chipsAvailable: number
  chipsSold: number
  chipPrice: string
  isOccupied: boolean
  type: 'residential' | 'commercial' | 'vacation'
  subType: keyof typeof subTypeLabels
}

export default function PropertyCard({
  image,
  addressLine1,
  cityStateZip,
  rentalReturn,
  projectedReturn,
  chipsAvailable,
  chipsSold,
  chipPrice,
  isOccupied,
  type,
  subType,
}: PropertyCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="w-full h-[360px] perspective cursor-pointer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className={clsx(
          'relative w-full h-full transition-transform duration-500 transform-style preserve-3d',
          flipped && 'rotate-y-180'
        )}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden bg-white border border-blue-900 rounded-xl shadow-md overflow-hidden">
          <div className="relative h-48 w-full">
            <Image src={image} alt="Property" fill objectFit="cover" />
          </div>
          <div className="p-4 text-gray-800">
            <h2 className="font-bold text-lg text-blue-900">{addressLine1}</h2>
            <p className="text-sm text-gray-500">{cityStateZip}</p>
            <div className="flex justify-between items-center mt-4 text-sm">
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isOccupied ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {isOccupied ? 'Occupied' : 'Vacant'}
              </span>
              <span className="text-lg">
                {typeIcons[type]}
              </span>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-50 border border-blue-900 rounded-xl shadow-md p-4 flex flex-col justify-center text-blue-900">
          <h2 className="font-bold text-lg mb-1">{addressLine1}</h2>
          <p className="text-sm text-gray-600 mb-4">{cityStateZip}</p>

          <div className="text-sm space-y-2">
            <p><strong>Rental Return:</strong> {rentalReturn}</p>
            <p><strong>Projected Return:</strong> {projectedReturn}</p>
            <p><strong>Chips Available:</strong> {chipsAvailable}</p>
            <p><strong>Chips Sold:</strong> {chipsSold}</p>
            <p>
              <strong>Property Type:</strong> {typeIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
            <div className="flex items-center gap-2">
              <strong>Subcategory:</strong>
              <Image
                src={`/icons/${subType}.png`}
                alt={subTypeLabels[subType]}
                width={24}
                height={24}
                className="opacity-80"
              />
              <span>{subTypeLabels[subType]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
