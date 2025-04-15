import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, XCircle, Upload, Image, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  price: z.string().refine((value) => {
    try {
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
  category: z.string({
    required_error: "Por favor, selecione uma categoria.",
  }).refine(value => value !== "0" && value !== "", {
    message: "Por favor, selecione uma categoria válida."
  }),
  enabled: z.boolean().default(true),
  variantBoxTitle: z.string().optional(),
  image: z.string().optional(),
});

const ProductForm = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
      image: "",
    },
  });

  useEffect(() => {
    if (imagePreview) {
      form.setValue("image", imagePreview);
    }
  }, [imagePreview]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('Category')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

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
            .select('*, Category(name)')
            .eq('id', Number(productId))
            .maybeSingle();

          if (productError) throw productError;
          if (!productData) throw new Error('Produto não encontrado');

          form.setValue('name', productData.name || "");
          form.setValue('description', productData.description || "");
          form.setValue('price', productData.price ? productData.price.toString() : "0");
          form.setValue('stockQuantity', productData.stock_quantity ? productData.stock_quantity.toString() : "0");
          form.setValue('category', productData.category ? productData.category.toString() : "");
          form.setValue('enabled', productData.enabled === false ? false : true);
          form.setValue('variantBoxTitle', productData.variant_box_title || "");
          form.setValue('image', productData.image || "");

          if (productData.image) {
            setImagePreview(productData.image);
          }

          if (productId) {
            const { data: variantsData, error: variantsError } = await supabase
              .from('Variant')
              .select('*')
              .eq('product', Number(productId));

            if (variantsError) throw variantsError;
            setVariants(variantsData || []);
          }
        } catch (error: any) {
          console.error("Error fetching product:", error);
          toast({
            title: "Erro ao carregar produto",
            description: "Não foi possível carregar os detalhes do produto. Tente novamente mais tarde.",
            variant: "destructive",
          });
          navigate("/products");
        }
      };

      fetchProduct();
    }
  }, [productId, form, navigate, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;

      const imagesBucketExists = buckets.some(bucket => bucket.name === 'images');
      if (!imagesBucketExists) {
        const { error: createBucketError } = await supabase.storage.createBucket('images', { public: true });
        if (createBucketError) throw createBucketError;
      }

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, imageFile, {
        upsert: true,
        contentType: imageFile.type
      });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro ao fazer upload da imagem",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const categoryId = parseInt(data.category);
      if (isNaN(categoryId) || categoryId <= 0) {
        toast({
          title: "Erro ao salvar produto",
          description: "Por favor, selecione uma categoria válida.",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = data.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        console.log("Uploaded image URL:", uploadedUrl);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData = {
        name: data.name,
        description: data.description || '',
        price: Number(data.price.replace(',', '.')),
        stock_quantity: Number(data.stockQuantity),
        category: categoryId,
        enabled: data.enabled,
        variant_box_title: data.variantBoxTitle || '',
        image: imageUrl || '',
        updated_at: new Date().toISOString(),
      };

      console.log("Product being saved:", productData);

      if (productId) {
        const { error } = await supabase.from('Product').update(productData).eq('id', Number(productId));
        if (error) throw error;
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from('Product').insert([{ ...productData, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast({ title: "Produto criado com sucesso!" });
      }

      navigate("/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Erro ao salvar produto",
        description: error.message || "Ocorreu um erro ao salvar o produto. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("image", "");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{productId ? "Editar Produto" : "Novo Produto"}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(saveProduct)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input id="name" {...form.register("name")} />
                    <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" {...form.register("description")} />
                  </div>
                  <div>
                    <Label htmlFor="price">Preço</Label>
                    <Input id="price" {...form.register("price")} />
                    <FormMessage>{form.formState.errors.price?.message}</FormMessage>
                  </div>
                  <div>
                    <Label htmlFor="stockQuantity">Estoque</Label>
                    <Input id="stockQuantity" {...form.register("stockQuantity")} />
                    <FormMessage>{form.formState.errors.stockQuantity?.message}</FormMessage>
                  </div>
                  <FormField name="category" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <Label>Ativo</Label>
                    <Switch checked={form.watch("enabled")} onCheckedChange={v => form.setValue("enabled", v)} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Imagem do Produto</Label>
                    <div className="border p-4 rounded-md space-y-2">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="rounded-md max-h-80 object-contain" alt="Preview" />
                          <Button type="button" variant="destructive" onClick={removeImage}>
                            <XCircle className="mr-2 h-4 w-4" /> Remover imagem
                          </Button>
                          <Input type="hidden" {...form.register("image")} />
                        </>
                      ) : (
                        <>
                          <Input type="file" id="image" accept="image/*" className="hidden" onChange={handleImageChange} />
                          <Button type="button" variant="outline" onClick={() => document.getElementById('image')?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Selecionar imagem
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting || uploading}>
                {(isSubmitting || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting || uploading ? "Salvando..." : "Salvar Produto"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;