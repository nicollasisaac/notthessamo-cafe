
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Coffee, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        
        // Get product count
        const { count: productCount, error: productError } = await supabase
          .from('Product')
          .select('*', { count: 'exact', head: true });
        
        if (productError) throw productError;
        
        // Get category count
        const { count: categoryCount, error: categoryError } = await supabase
          .from('Category')
          .select('*', { count: 'exact', head: true });
        
        if (categoryError) throw categoryError;
        
        setProductCount(productCount || 0);
        setCategoryCount(categoryCount || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error loading dashboard data",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted"></CardHeader>
              <CardContent className="h-24 bg-muted mt-2"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total items in inventory
              </p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/products" className="flex items-center">
                    <span>Manage Products</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total product categories
              </p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/categories" className="flex items-center">
                    <span>Manage Categories</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild size="sm" className="w-full">
                <Link to="/products/new" className="flex items-center justify-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Add New Product</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/categories/new" className="flex items-center justify-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Add New Category</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
