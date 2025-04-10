
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase, Product, Category } from '../config/database';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const ProductForm = () => {
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    enabled: true,
    image: '',
    category: undefined,
    variant_box_title: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error loading categories",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Product')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error loading product",
        description: "Please try again later.",
        variant: "destructive",
      });
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: parseFloat(value) || 0 });
  };

  const handleCategoryChange = (value: string) => {
    setProduct({ ...product, category: parseInt(value) });
  };

  const handleEnabledChange = (checked: boolean) => {
    setProduct({ ...product, enabled: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!product.name?.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a product name.",
        variant: "destructive",
      });
      return;
    }
    
    if (product.price === undefined || product.price < 0) {
      toast({
        title: "Invalid price",
        description: "Please provide a valid price.",
        variant: "destructive",
      });
      return;
    }
    
    if (product.category === undefined) {
      toast({
        title: "Missing category",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Format data
      const productData = {
        ...product,
        updated_at: new Date().toISOString(),
      };
      
      if (isEditMode) {
        // Update existing product
        const { error } = await supabase
          .from('Product')
          .update(productData)
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Product updated",
          description: "The product has been updated successfully.",
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('Product')
          .insert([productData]);
        
        if (error) throw error;
        
        toast({
          title: "Product created",
          description: "The new product has been created successfully.",
        });
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error saving product",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name*</Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={product.description || ''}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price*</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={handleNumberChange}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity*</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={product.stock_quantity}
                  onChange={handleNumberChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select 
                value={product.category?.toString()} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={product.image || ''}
                onChange={handleChange}
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variant_box_title">Variant Box Title (optional)</Label>
              <Input
                id="variant_box_title"
                name="variant_box_title"
                value={product.variant_box_title || ''}
                onChange={handleChange}
                placeholder="Enter variant box title"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="enabled"
                checked={product.enabled}
                onCheckedChange={handleEnabledChange}
              />
              <Label htmlFor="enabled">Product is enabled</Label>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/products')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditMode ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
