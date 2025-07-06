'use client'

import { createBrowserClient } from '@supabase/ssr'

// Uses environment variables automatically
export const supabase = createBrowserClient()