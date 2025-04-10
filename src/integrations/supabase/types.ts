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
      Addition: {
        Row: {
          created_at: string | null
          id: number
          name: string
          price: number
          product: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          price: number
          product?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          price?: number
          product?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "addition_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Category: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      Client: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string | null
          tel: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          tel?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          tel?: string | null
        }
        Relationships: []
      }
      Order: {
        Row: {
          client: number | null
          created_at: string | null
          id: number
          is_takeout: boolean | null
          price: number
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          client?: number | null
          created_at?: string | null
          id?: number
          is_takeout?: boolean | null
          price: number
          status: Database["public"]["Enums"]["status"]
        }
        Update: {
          client?: number | null
          created_at?: string | null
          id?: number
          is_takeout?: boolean | null
          price?: number
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "Order_client_fkey"
            columns: ["client"]
            isOneToOne: false
            referencedRelation: "Client"
            referencedColumns: ["id"]
          },
        ]
      }
      OrderProductAdditions: {
        Row: {
          addition: number | null
          id: number
          order_product: number
        }
        Insert: {
          addition?: number | null
          id?: number
          order_product: number
        }
        Update: {
          addition?: number | null
          id?: number
          order_product?: number
        }
        Relationships: [
          {
            foreignKeyName: "orderproductadditions_addition_fkey"
            columns: ["addition"]
            isOneToOne: false
            referencedRelation: "Addition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "OrderProductAdditions_order_product_fkey"
            columns: ["order_product"]
            isOneToOne: false
            referencedRelation: "OrderProducts"
            referencedColumns: ["id"]
          },
        ]
      }
      OrderProducts: {
        Row: {
          id: number
          order_id: number | null
          product: number | null
          variant: number | null
        }
        Insert: {
          id?: number
          order_id?: number | null
          product?: number | null
          variant?: number | null
        }
        Update: {
          id?: number
          order_id?: number | null
          product?: number | null
          variant?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "OrderProducts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orderproducts_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orderproducts_variant_fkey"
            columns: ["variant"]
            isOneToOne: false
            referencedRelation: "Variant"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          category: number | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: number
          image: string | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
          variant_box_title: string | null
        }
        Insert: {
          category?: number | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          image?: string | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
          variant_box_title?: string | null
        }
        Update: {
          category?: number | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          image?: string | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
          variant_box_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
        ]
      }
      Product_duplicate: {
        Row: {
          category: number | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: number
          image: string | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
          variant_box_title: string | null
        }
        Insert: {
          category?: number | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          image?: string | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
          variant_box_title?: string | null
        }
        Update: {
          category?: number | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: number
          image?: string | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
          variant_box_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Product_duplicate_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
        ]
      }
      Variant: {
        Row: {
          created_at: string | null
          id: number
          name: string
          price: number
          product: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          price: number
          product?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          price?: number
          product?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "variant_product_fkey"
            columns: ["product"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      status: "new" | "progress" | "canceled" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status: ["new", "progress", "canceled", "done"],
    },
  },
} as const
