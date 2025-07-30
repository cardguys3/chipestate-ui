// /app/dashboard/types.ts

export interface Chip {
  id: string
  serial: string
  property_id: string
}

export interface Property {
  id: string
  title: string
}

export interface ChipEarnings {
  id: string
  chip_id: string
  amount: number
  date: string
}

export interface UserBadge {
  key: string
  name: string
  description: string
  icon_url: string
}
