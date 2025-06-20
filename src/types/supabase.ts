// This file can be auto-generated using the Supabase CLI with:
// supabase gen types typescript --project-id <your-project-id>

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
