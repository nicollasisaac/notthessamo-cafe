
import { createClient } from '@supabase/supabase-js';

// Database connection configuration
const supabaseUrl = 'https://hivipgycifvbesazqghw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdmlwZ3ljaWZ2YmVzYXpxZ2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4NzM5NzAsImV4cCI6MjAyODQ0OTk3MH0.YqEJX-bkxcSXJYI9YK5nQBeKRMKxI0qJAZvsTXs3_Sg';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);

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
