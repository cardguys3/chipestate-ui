// File: /types/index.ts

// ==== BLOCK: types/index.ts - updated User type ====

export type User = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  is_approved: boolean
  is_active: boolean
  email_confirmed_at: string | null
  city: string
  state: string
  zip: string
}

// ==== BLOCK: types/index.ts - updated User type END ====


// ==== BLOCK: Property Type ====

export type Property = {
  id: string
  title: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  zip: string
  purchase_price: number
  current_value: number
  total_chips: number
  chips_available: number
  property_type: string
  sub_type: string
  property_manager_id?: string
  reserve_balance: number
  occupied?: boolean
  is_hidden?: boolean
  is_active?: boolean
  image_urls?: string[]
}

// ==== BLOCK: Property Type END ====


// ==== BLOCK: BadgeWithIcon Type ====

export interface BadgeWithIcon {
  key: string
  name: string
  description: string
  icon_url: string
}

// ==== BLOCK: BadgeWithIcon Type END ====


// ==== BLOCK: Chip Type ====

export interface Chip {
  id: string
  serial: string
  property_id: string
}

// ==== BLOCK: Chip Type END ====


// ==== BLOCK: ChipEarnings Type ====

export interface ChipEarnings {
  id: string
  chip_id: string
  amount: number
  date: string
}

// ==== BLOCK: ChipEarnings Type END ====


// ==== BLOCK: UserBadge Type ====

export interface UserBadge {
  key: string
  name: string
  description: string
  icon_url: string
}

// ==== BLOCK: UserBadge Type END ====


// ==== BLOCK: MonthlyPayout Type ====

export interface MonthlyPayout {
  date: string;
  amount: number;
  chip_id?: string;
  property_id?: string;
}

// ==== BLOCK: MonthlyPayout Type END ====
