
import { supabase } from '@/integrations/supabase/client';

// Type definitions for our database schemas
export type Category = {
  id: number;
  created_at: string;
  name: string;
};

export type Product = {
  id: number;
  created_at: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
  image: string;
  updated_at: string;
  stock_quantity: number;
  category: number;
  variant_box_title: string;
  categoryName?: string; // Added for UI display
};

// Re-export supabase client for easier imports across the app
export { supabase };
