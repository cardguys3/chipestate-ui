export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chip_earnings: {
        Row: {
          amount: number
          chip_id: string | null
          created_at: string | null
          earning_date: string
          id: string
          property_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          chip_id?: string | null
          created_at?: string | null
          earning_date: string
          id?: string
          property_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          chip_id?: string | null
          created_at?: string | null
          earning_date?: string
          id?: string
          property_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chip_earnings_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_earnings_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_earnings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      chip_ownerships: {
        Row: {
          acquired_at: string | null
          acquired_by: string | null
          chip_id: string | null
          id: string
          is_current: boolean | null
          user_id: string | null
        }
        Insert: {
          acquired_at?: string | null
          acquired_by?: string | null
          chip_id?: string | null
          id?: string
          is_current?: boolean | null
          user_id?: string | null
        }
        Update: {
          acquired_at?: string | null
          acquired_by?: string | null
          chip_id?: string | null
          id?: string
          is_current?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chip_ownerships_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_ownerships_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_ownerships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      chip_purchase_transactions: {
        Row: {
          chip_ids: string[]
          created_at: string | null
          id: string
          paypal_transaction_id: string
          property_id: string
          quantity: number
          total_amount: number | null
          user_id: string
        }
        Insert: {
          chip_ids: string[]
          created_at?: string | null
          id?: string
          paypal_transaction_id: string
          property_id: string
          quantity: number
          total_amount?: number | null
          user_id: string
        }
        Update: {
          chip_ids?: string[]
          created_at?: string | null
          id?: string
          paypal_transaction_id?: string
          property_id?: string
          quantity?: number
          total_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chip_purchase_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_purchase_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_extended"
            referencedColumns: ["id"]
          },
        ]
      }
      chips: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          current_value: number | null
          id: string
          is_active: boolean | null
          is_hidden: boolean | null
          owner_id: string | null
          property_id: string | null
          serial: string
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          owner_id?: string | null
          property_id?: string | null
          serial: string
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          owner_id?: string | null
          property_id?: string | null
          serial?: string
        }
        Relationships: [
          {
            foreignKeyName: "chips_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chips_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          chips_available: number
          city: string | null
          created_at: string | null
          current_value: number | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_active: boolean | null
          is_hidden: boolean | null
          manager_name: string | null
          occupied: boolean | null
          property_manager_id: string | null
          property_type: string | null
          purchase_price: number | null
          reserve_balance: number | null
          state: string | null
          sub_type: string | null
          title: string
          total_chips: number
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          chips_available: number
          city?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          manager_name?: string | null
          occupied?: boolean | null
          property_manager_id?: string | null
          property_type?: string | null
          purchase_price?: number | null
          reserve_balance?: number | null
          state?: string | null
          sub_type?: string | null
          title: string
          total_chips: number
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          chips_available?: number
          city?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          manager_name?: string | null
          occupied?: boolean | null
          property_manager_id?: string | null
          property_type?: string | null
          purchase_price?: number | null
          reserve_balance?: number | null
          state?: string | null
          sub_type?: string | null
          title?: string
          total_chips?: number
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_property_manager_id_fkey"
            columns: ["property_manager_id"]
            isOneToOne: false
            referencedRelation: "property_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      property_logs: {
        Row: {
          action: string | null
          admin_email: string | null
          changes: Json | null
          created_at: string | null
          id: string
          property_id: string | null
        }
        Insert: {
          action?: string | null
          admin_email?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          property_id?: string | null
        }
        Update: {
          action?: string | null
          admin_email?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_managers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          compliant_states: string[] | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          maintenance_response_hours: number | null
          management_fee_amount: number | null
          management_fee_type: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_owner_communication: string | null
          preferred_tenant_communication: string | null
          reference_contacts: string[] | null
          reporting_frequency: string | null
          reporting_type: string | null
          services_offered: string[] | null
          state: string | null
          years_experience: number | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          compliant_states?: string[] | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          maintenance_response_hours?: number | null
          management_fee_amount?: number | null
          management_fee_type?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_owner_communication?: string | null
          preferred_tenant_communication?: string | null
          reference_contacts?: string[] | null
          reporting_frequency?: string | null
          reporting_type?: string | null
          services_offered?: string[] | null
          state?: string | null
          years_experience?: number | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          compliant_states?: string[] | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          maintenance_response_hours?: number | null
          management_fee_amount?: number | null
          management_fee_type?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_owner_communication?: string | null
          preferred_tenant_communication?: string | null
          reference_contacts?: string[] | null
          reporting_frequency?: string | null
          reporting_type?: string | null
          services_offered?: string[] | null
          state?: string | null
          years_experience?: number | null
          zip?: string | null
        }
        Relationships: []
      }
      property_transactions: {
        Row: {
          amount: number
          auto_generated: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          linked_chip_payout: boolean | null
          notes: string | null
          property_id: string
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          linked_chip_payout?: boolean | null
          notes?: string | null
          property_id: string
          transaction_date?: string
          type: string
        }
        Update: {
          amount?: number
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          linked_chip_payout?: boolean | null
          notes?: string | null
          property_id?: string
          transaction_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      users_extended: {
        Row: {
          created_at: string | null
          dob: string | null
          email: string
          first_name: string | null
          id: string
          is_approved: boolean | null
          last_name: string | null
          license_back_url: string | null
          license_front_url: string | null
          mail_address_line1: string | null
          mail_address_line2: string | null
          mail_city: string | null
          mail_state: string | null
          mail_zip: string | null
          middle_name: string | null
          phone: string | null
          registration_status: string | null
          res_address_line1: string | null
          res_address_line2: string | null
          res_city: string | null
          res_state: string | null
          res_zip: string | null
        }
        Insert: {
          created_at?: string | null
          dob?: string | null
          email: string
          first_name?: string | null
          id: string
          is_approved?: boolean | null
          last_name?: string | null
          license_back_url?: string | null
          license_front_url?: string | null
          mail_address_line1?: string | null
          mail_address_line2?: string | null
          mail_city?: string | null
          mail_state?: string | null
          mail_zip?: string | null
          middle_name?: string | null
          phone?: string | null
          registration_status?: string | null
          res_address_line1?: string | null
          res_address_line2?: string | null
          res_city?: string | null
          res_state?: string | null
          res_zip?: string | null
        }
        Update: {
          created_at?: string | null
          dob?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_approved?: boolean | null
          last_name?: string | null
          license_back_url?: string | null
          license_front_url?: string | null
          mail_address_line1?: string | null
          mail_address_line2?: string | null
          mail_city?: string | null
          mail_state?: string | null
          mail_zip?: string | null
          middle_name?: string | null
          phone?: string | null
          registration_status?: string | null
          res_address_line1?: string | null
          res_address_line2?: string | null
          res_city?: string | null
          res_state?: string | null
          res_zip?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      chip_earnings_monthly: {
        Row: {
          chip_id: string | null
          month: string | null
          property_id: string | null
          total: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chip_earnings_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_earnings_chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "chips_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_earnings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      chips_view: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          is_hidden: boolean | null
          property_id: string | null
          property_title: string | null
          serial: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chips_owner_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chips_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      bulk_assign_chips: {
        Args: { property_uuid: string; user_uuid: string; count: number }
        Returns: undefined
      }
      bulk_create_chips: {
        Args: { property_uuid: string; count: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
