
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
        title: "Erro ao carregar categorias",
        description: "Tente novamente mais tarde.",
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
        .eq('id', parseInt(id || '0'))
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Erro ao carregar produto",
        description: "Tente novamente mais tarde.",
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
        title: "Informação faltando",
        description: "Por favor, forneça um nome para o produto.",
        variant: "destructive",
      });
      return;
    }
    
    if (product.price === undefined || product.price < 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, forneça um preço válido.",
        variant: "destructive",
      });
      return;
    }
    
    if (product.category === undefined) {
      toast({
        title: "Categoria faltando",
        description: "Por favor, selecione uma categoria.",
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
      
      if (isEditMode && id) {
        // Update existing product
        const { error } = await supabase
          .from('Product')
          .update(productData)
          .eq('id', parseInt(id));
        
        if (error) throw error;
        
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      } else {
        // Create new product - fix by ensuring we pass a single object, not an array
        const { error } = await supabase
          .from('Product')
          .insert(productData);
        
        if (error) throw error;
        
        toast({
          title: "Produto criado",
          description: "O novo produto foi criado com sucesso.",
        });
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro ao salvar produto",
        description: "Tente novamente mais tarde.",
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
            {isEditMode ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto*</Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Digite o nome do produto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={product.description || ''}
                onChange={handleChange}
                placeholder="Digite a descrição do produto"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço*</Label>
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
                <Label htmlFor="stock_quantity">Quantidade em Estoque*</Label>
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
              <Label htmlFor="category">Categoria*</Label>
              <Select 
                value={product.category?.toString()} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                name="image"
                value={product.image || ''}
                onChange={handleChange}
                placeholder="Digite a URL da imagem"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="variant_box_title">Título do Box Variante (opcional)</Label>
              <Input
                id="variant_box_title"
                name="variant_box_title"
                value={product.variant_box_title || ''}
                onChange={handleChange}
                placeholder="Digite o título do box variante"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="enabled"
                checked={product.enabled}
                onCheckedChange={handleEnabledChange}
              />
              <Label htmlFor="enabled">Produto está habilitado</Label>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/products')}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditMode ? 'Atualizar Produto' : 'Criar Produto'
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
