
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase, Category } from '../config/database';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CategoryForm = () => {
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setName(data.name);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast({
        title: "Error loading category",
        description: "Please try again later.",
        variant: "destructive",
      });
      navigate('/categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a category name.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      if (isEditMode) {
        // Update existing category
        const { error } = await supabase
          .from('Category')
          .update({ name })
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('Category')
          .insert([{ name }]);
        
        if (error) throw error;
        
        toast({
          title: "Category created",
          description: "The new category has been created successfully.",
        });
      }
      
      navigate('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error saving category",
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
            {isEditMode ? 'Edit Category' : 'Add New Category'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/categories')}
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
                  isEditMode ? 'Update Category' : 'Create Category'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryForm;
