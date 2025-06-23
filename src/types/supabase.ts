// This file can be auto-generated using the Supabase CLI with:
// supabase gen types typescript --project-id <your-project-id>

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      stripe_customers: {
        Row: {
          id: number
          user_id: string
          customer_id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: never
          user_id: string
          customer_id: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: never
          user_id?: string
          customer_id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      stripe_subscriptions: {
        Row: {
          id: number
          customer_id: string
          subscription_id: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean
          payment_method_brand: string | null
          payment_method_last4: string | null
          status: "not_started" | "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused"
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: never
          customer_id: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: number | null
          current_period_end?: number | null
          cancel_at_period_end?: boolean
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status: "not_started" | "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: never
          customer_id?: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: number | null
          current_period_end?: number | null
          cancel_at_period_end?: boolean
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status?: "not_started" | "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      stripe_orders: {
        Row: {
          id: number
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: number
          amount_total: number
          currency: string
          payment_status: string
          status: "pending" | "completed" | "canceled"
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: never
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: number
          amount_total: number
          currency: string
          payment_status: string
          status?: "pending" | "completed" | "canceled"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: never
          checkout_session_id?: string
          payment_intent_id?: string
          customer_id?: string
          amount_subtotal?: number
          amount_total?: number
          currency?: string
          payment_status?: string
          status?: "pending" | "completed" | "canceled"
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: "not_started" | "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused" | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
      stripe_user_orders: {
        Row: {
          customer_id: string | null
          order_id: number | null
          checkout_session_id: string | null
          payment_intent_id: string | null
          amount_subtotal: number | null
          amount_total: number | null
          currency: string | null
          payment_status: string | null
          order_status: "pending" | "completed" | "canceled" | null
          order_date: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      stripe_subscription_status: "not_started" | "incomplete" | "incomplete_expired" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused"
      stripe_order_status: "pending" | "completed" | "canceled"
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define the Database interface
export interface Database {
  public: {
    Tables: {
      // Define your database tables here if needed
    }
    Views: {
      // Define your views here if needed
    }
    Functions: {
      // Define your functions here if needed
    }
    Enums: {
      // Define your enums here if needed
    }
  }
}

// Extend the Supabase client types for better type safety
declare module '@supabase/supabase-js' {
  interface FunctionsClient {
    invoke<T = any, P = unknown>(
      functionName: string,
      options?: {
        body?: P;
        headers?: Record<string, string>;
      }
    ): Promise<{ data: T | null; error: Error | null }>;
  }
}

// Utility types for table access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
