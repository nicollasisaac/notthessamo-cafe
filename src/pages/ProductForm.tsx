import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.string().refine((value) => {
    try {
      // Substitui vírgula por ponto e tenta converter para número
      const numberValue = Number(value.replace(',', '.'));
      return !isNaN(numberValue) && numberValue > 0;
    } catch (error) {
      return false;
    }
  }, {
    message: "O preço deve ser um número válido maior que zero.",
  }),
  stockQuantity: z.string().refine((value) => {
    try {
      const numberValue = Number(value);
      return !isNaN(numberValue) && numberValue >= 0;
    } catch (error) {
      return false;
    }
  }, {
    message: "A quantidade em estoque deve ser um número inteiro não negativo.",
  }),
  category: z.string().refine((value) => {
    try {
      const numberValue = Number(value);
      return !isNaN(numberValue) && numberValue > 0;
    } catch (error) {
      return false;
    }
  }, {
    message: "Selecione uma categoria válida.",
  }),
  enabled: z.boolean().default(true),
  variantBoxTitle: z.string().optional(),
});

const ProductForm = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id: productId } = useParams<{ id: string }>();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "",
      enabled: true,
      variantBoxTitle: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('Category')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (error: any) {
        console.error("Error fetching categories:", error.message);
        toast({
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar as categorias. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const { data: productData, error: productError } = await supabase
            .from('Product')
            .select('*')
            .eq('id', productId)
            .single();

          if (productError) throw productError;

          setProduct(productData);

          form.setValue('name', productData.name);
          form.setValue('description', productData.description || "");
          form.setValue('price', productData.price.toString());
          form.setValue('stockQuantity', productData.stock_quantity.toString());
          form.setValue('category', productData.category.toString());
          form.setValue('enabled', productData.enabled);
          form.setValue('variantBoxTitle', productData.variant_box_title || "");

          // Fetch variants
          const { data: variantsData, error: variantsError } = await supabase
            .from('Variant')
            .select('*')
            .eq('product_id', productId);

          if (variantsError) throw variantsError;

          setVariants(variantsData || []);
        } catch (error: any) {
          console.error("Error fetching product:", error.message);
          toast({
            title: "Erro ao carregar produto",
            description: "Não foi possível carregar os detalhes do produto. Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      };

      fetchProduct();
    }
  }, [productId, form, toast]);

  const saveProduct = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const productData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock_quantity: Number(data.stockQuantity),
        category: Number(data.category),
        enabled: data.enabled,
        variant_box_title: data.variantBoxTitle,
        updated_at: new Date().toISOString(),
      };

      if (productId) {
        const { error } = await supabase
          .from('Product')
          .update(productData)
          .eq('id', productId);

        if (error) {
          throw error;
        }

        toast({
          title: "Produto atualizado com sucesso!",
        });
      } else {
        const { data: newProduct, error } = await supabase
          .from('Product')
          .insert([
            {
              ...productData,
              created_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) {
          throw error;
        }

        toast({
          title: "Produto criado com sucesso!",
        });

        // If creating a new product, navigate to the edit page
        if (newProduct && newProduct.length > 0) {
          navigate(`/products/edit/${newProduct[0].id}`);
        }
      }

      navigate("/products");
    } catch (error: any) {
      console.error("Error saving product:", error.message);
      toast({
        title: "Erro ao salvar produto",
        description: "Ocorreu um erro ao salvar o produto. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: Date.now(), // Temporary ID
        name: '',
        price: 0,
        product_id: productId,
        isNew: true, // Flag to indicate it's a new variant
      },
    ]);
  };

  const updateVariant = (id: any, field: string, value: string | number | boolean) => {
    setVariants(
      variants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const saveVariant = async (variant: any) => {
    try {
      setIsSubmitting(true);
      const variantData = {
        name: variant.name,
        price: Number(variant.price),
        product_id: productId,
      };

      if (variant.isNew) {
        const { data, error } = await supabase
          .from('Variant')
          .insert([variantData])
          .select();

        if (error) {
          throw error;
        }

        // Update the variant in the state with the actual ID from the database
        setVariants(
          variants.map((v) =>
            v.id === variant.id ? { ...data[0], isNew: false } : v
          )
        );

        toast({
          title: "Variante criada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('Variant')
          .update(variantData)
          .eq('id', variant.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Variante atualizada com sucesso!",
        });
      }
    } catch (error: any) {
      console.error("Error saving variant:", error.message);
      toast({
        title: "Erro ao salvar variante",
        description: "Ocorreu um erro ao salvar a variante. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVariant = async (id: any) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('Variant').delete().eq('id', id);

      if (error) {
        throw error;
      }

      // Remove the variant from the state
      setVariants(variants.filter((variant) => variant.id !== id));

      toast({
        title: "Variante removida com sucesso!",
      });
    } catch (error: any) {
      console.error("Error deleting variant:", error.message);
      toast({
        title: "Erro ao remover variante",
        description: "Ocorreu um erro ao remover a variante. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{productId ? "Editar Produto" : "Novo Produto"}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(saveProduct)} className="space-y-4">
            <div>
              <Label htmlFor="name" className="form-label">Nome do Produto</Label>
              <Input id="name" type="text" className="form-input" placeholder="Nome do produto" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description" className="form-label">Descrição</Label>
              <Textarea id="description" className="form-input" placeholder="Descrição do produto" {...form.register("description")} />
            </div>
            <div>
              <Label htmlFor="price" className="form-label">Preço</Label>
              <Input
                id="price"
                type="text"
                className="form-input"
                placeholder="Preço do produto"
                {...form.register("price")}
              />
              {form.formState.errors.price && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="stockQuantity" className="form-label">Quantidade em Estoque</Label>
              <Input
                id="stockQuantity"
                type="text"
                className="form-input"
                placeholder="Quantidade em estoque"
                {...form.register("stockQuantity")}
              />
              {form.formState.errors.stockQuantity && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.stockQuantity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="category" className="form-label">Categoria</Label>
              <Select onValueChange={form.setValue.bind(null, 'category')} defaultValue={product?.category?.toString()}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="enabled" className="form-label">Ativo</Label>
              <Switch id="enabled" checked={form.getValues("enabled")} onCheckedChange={form.setValue.bind(null, 'enabled')} />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {productId && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Variantes do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            {variants.length > 0 && (
              <div className="mb-4">
                <Label htmlFor="variantBoxTitle" className="form-label">Título da Caixa de Variantes</Label>
                <Input
                  id="variantBoxTitle"
                  type="text"
                  className="form-input"
                  placeholder="Título da caixa de variantes"
                  {...form.register("variantBoxTitle")}
                />
              </div>
            )}
            {variants.map((variant) => (
              <div key={variant.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor={`variant-name-${variant.id}`} className="form-label">Nome da Variante</Label>
                  <Input
                    id={`variant-name-${variant.id}`}
                    type="text"
                    className="form-input"
                    placeholder="Nome"
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`variant-price-${variant.id}`} className="form-label">Preço da Variante</Label>
                  <Input
                    id={`variant-price-${variant.id}`}
                    type="text"
                    className="form-input"
                    placeholder="Preço"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex items-end justify-end">
                  <Button type="button" variant="secondary" onClick={() => saveVariant(variant)} disabled={isSubmitting} className="mr-2">
                    {isSubmitting ? "Salvando..." : "Salvar Variante"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => deleteVariant(variant.id)} disabled={isSubmitting}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addVariant} disabled={isSubmitting}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Variante
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductForm;
