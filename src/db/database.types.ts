export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_daily_usage: {
        Row: {
          call_count: number
          day: string
          feature: string
          id: number
          tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          call_count?: number
          day: string
          feature: string
          id?: number
          tokens_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          call_count?: number
          day?: string
          feature?: string
          id?: number
          tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          created_at: string
          feature: string
          id: string
          input_tokens: number
          meta: Json | null
          model: string | null
          output_tokens: number
          prompt: string | null
          response_summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          input_tokens?: number
          meta?: Json | null
          model?: string | null
          output_tokens?: number
          prompt?: string | null
          response_summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          input_tokens?: number
          meta?: Json | null
          model?: string | null
          output_tokens?: number
          prompt?: string | null
          response_summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      planner_entries: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          planning_date: string
          portion_multiplier: number
          recipe_id: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          planning_date: string
          portion_multiplier?: number
          recipe_id: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          planning_date?: string
          portion_multiplier?: number
          recipe_id?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          aliases: string[] | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aliases?: string[] | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aliases?: string[] | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          position: number
          product_id: string | null
          quantity: number | null
          raw_text: string
          recipe_id: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          product_id?: string | null
          quantity?: number | null
          raw_text: string
          recipe_id: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          position?: number
          product_id?: string | null
          quantity?: number | null
          raw_text?: string
          recipe_id?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_seed_copy: boolean
          prep_time_minutes: number | null
          scope: string
          search_vector: unknown
          servings: number | null
          slug: string
          source_url: string | null
          title: string
          updated_at: string
          user_id: string | null
          visibility: string
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_seed_copy?: boolean
          prep_time_minutes?: number | null
          scope: string
          search_vector?: unknown
          servings?: number | null
          slug: string
          source_url?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          visibility?: string
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_seed_copy?: boolean
          prep_time_minutes?: number | null
          scope?: string
          search_vector?: unknown
          servings?: number | null
          slug?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          visibility?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          created_at: string
          id: string
          is_checked: boolean
          notes: string | null
          overridden_quantity: number | null
          overridden_unit: string | null
          planner_entry_id: string | null
          product_id: string | null
          quantity: number | null
          recipe_id: string | null
          shopping_list_id: string
          sort_order: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_checked?: boolean
          notes?: string | null
          overridden_quantity?: number | null
          overridden_unit?: string | null
          planner_entry_id?: string | null
          product_id?: string | null
          quantity?: number | null
          recipe_id?: string | null
          shopping_list_id: string
          sort_order?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_checked?: boolean
          notes?: string | null
          overridden_quantity?: number | null
          overridden_unit?: string | null
          planner_entry_id?: string | null
          product_id?: string | null
          quantity?: number | null
          recipe_id?: string | null
          shopping_list_id?: string
          sort_order?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_planner_entry_id_fkey"
            columns: ["planner_entry_id"]
            isOneToOne: false
            referencedRelation: "planner_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey"
            columns: ["shopping_list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          generated_from_end: string | null
          generated_from_start: string | null
          id: string
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          generated_from_end?: string | null
          generated_from_start?: string | null
          id?: string
          status: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          generated_from_end?: string | null
          generated_from_start?: string | null
          id?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

