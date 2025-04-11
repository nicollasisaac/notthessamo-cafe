
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Loader2, Filter, Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined);
  }, [selectedCategory]);

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

  const fetchProducts = async (categoryId?: number) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('Product')
        .select(`
          *,
          Category(name)
        `);
      
      if (categoryId) {
        query = query.eq('category', categoryId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      // Transform data to match our Product type with categoryName
      const transformedData = data.map(item => ({
        ...item,
        categoryName: item.Category?.name
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = async (product: any) => {
    try {
      const { error } = await supabase
        .from('Product')
        .update({ enabled: !product.enabled })
        .eq('id', product.id);
      
      if (error) throw error;
      
      // Update local state
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, enabled: !p.enabled } : p
      ));
      
      toast({
        title: `Produto ${product.enabled ? 'desabilitado' : 'habilitado'}`,
        description: `${product.name} foi ${product.enabled ? 'desabilitado' : 'habilitado'}.`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
        <Button asChild>
          <Link to="/products/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            <span>Adicionar Produto</span>
          </Link>
        </Button>
      </div>

      {/* Filter dropdown */}
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground mb-4">
            {selectedCategory !== 'all' 
              ? "Nenhum produto encontrado nesta categoria."
              : "Nenhum produto encontrado. Crie seu primeiro produto para começar."}
          </p>
          <Button asChild>
            <Link to="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              <span>Adicionar Produto</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-20 w-20 rounded-md object-cover" 
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-md bg-secondary flex items-center justify-center">
                          <Coffee className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <span className="truncate max-w-[150px]">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.categoryName || '-'}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={product.enabled} 
                      onCheckedChange={() => handleToggleEnabled(product)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/products/edit/${product.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Products;
