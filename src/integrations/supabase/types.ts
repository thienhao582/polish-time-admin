export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          duration_minutes: number | null
          employee_id: string | null
          employee_name: string | null
          id: string
          notes: string | null
          price: number | null
          service_id: string | null
          service_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          duration_minutes?: number | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          service_id?: string | null
          service_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number | null
          employee_id?: string | null
          employee_name?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          service_id?: string | null
          service_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          check_in_date: string
          check_in_time: string
          created_at: string
          customer_name: string
          customer_number: string
          customer_phone: string | null
          id: string
          notes: string | null
          services: string[] | null
          status: string
          tags: string[] | null
          updated_at: string
          wait_time: number | null
        }
        Insert: {
          check_in_date?: string
          check_in_time: string
          created_at?: string
          customer_name: string
          customer_number: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          services?: string[] | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          wait_time?: number | null
        }
        Update: {
          check_in_date?: string
          check_in_time?: string
          created_at?: string
          customer_name?: string
          customer_number?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          services?: string[] | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          wait_time?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          birthday: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          assigned_services: string[] | null
          commission_rate: number | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          role: string | null
          specialties: string[] | null
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_services?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          role?: string | null
          specialties?: string[] | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_services?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          specialties?: string[] | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_customers: {
        Row: {
          address: string | null
          birthday: string | null
          created_at: string | null
          email: string | null
          id: string
          join_date: string | null
          last_visit: string | null
          member_level: string | null
          name: string
          notes: string | null
          phone: string | null
          points: number | null
          total_spent: number | null
          updated_at: string | null
          visit_count: number | null
          visit_history: Json | null
        }
        Insert: {
          address?: string | null
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          last_visit?: string | null
          member_level?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          points?: number | null
          total_spent?: number | null
          updated_at?: string | null
          visit_count?: number | null
          visit_history?: Json | null
        }
        Update: {
          address?: string | null
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          last_visit?: string | null
          member_level?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          points?: number | null
          total_spent?: number | null
          updated_at?: string | null
          visit_count?: number | null
          visit_history?: Json | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string
          discount: number | null
          id: string
          invoice_number: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          services: Json
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          discount?: number | null
          id?: string
          invoice_number: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          services?: Json
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          discount?: number | null
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          services?: Json
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_earnings: {
        Row: {
          appointment_id: string
          base_service_price: number
          commission_amount: number
          commission_rate: number
          created_at: string
          earned_date: string
          employee_id: string
          id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          base_service_price: number
          commission_amount: number
          commission_rate: number
          created_at?: string
          earned_date: string
          employee_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          base_service_price?: number
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          earned_date?: string
          employee_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          name: string
          price: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          name: string
          price: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      time_records: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          employee_id: string
          employee_name: string
          id: string
          notes: string | null
          status: string | null
          total_hours: number | null
          updated_at: string | null
          work_date: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          employee_id: string
          employee_name: string
          id?: string
          notes?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
          work_date: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          employee_id?: string
          employee_name?: string
          id?: string
          notes?: string | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string | null
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          session_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          session_token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          pin_code: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          pin_code: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          pin_code?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "owner" | "employee" | "cashier"
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
    Enums: {
      user_role: ["owner", "employee", "cashier"],
    },
  },
} as const
