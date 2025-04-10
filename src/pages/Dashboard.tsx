import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Coffee, Tag, BarChart4, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import WeeklySalesComparison from '@/components/dashboard/WeeklySalesComparison';
import ProductAnalysis from '@/components/dashboard/ProductAnalysis';
import CategoryRevenue from '@/components/dashboard/CategoryRevenue';
import ProductCombinations from '@/components/dashboard/ProductCombinations';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<string>("month");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Handle date range changes
  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Handle period selection changes
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    // Reset custom date range when switching to predefined periods
    if (newPeriod !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

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
          title: "Erro ao carregar dados do painel",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [toast]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Calcular datas com base no período selecionado
        const hoje = new Date();
        let dataInicio = new Date();

        if (period === 'custom' && startDate && endDate) {
          dataInicio = startDate;
          // Ajustar para o fim do dia
          const ajustedEndDate = new Date(endDate);
          ajustedEndDate.setHours(23, 59, 59, 999);
          hoje.setTime(ajustedEndDate.getTime());
        } else {
          switch (period) {
            case 'today':
              dataInicio = new Date(hoje);
              dataInicio.setHours(0, 0, 0, 0);
              break;
            case 'week':
              dataInicio = new Date(hoje);
              dataInicio.setDate(hoje.getDate() - 7);
              break;
            case 'month':
              dataInicio = new Date(hoje);
              dataInicio.setMonth(hoje.getMonth() - 1);
              break;
            default:
              dataInicio = new Date(hoje);
              dataInicio.setMonth(hoje.getMonth() - 1);
          }
        }

        // Formatar as datas para o formato ISO (string)
        const isoDataInicio = dataInicio.toISOString();
        const isoHoje = hoje.toISOString();

        // Buscar pedidos com status "done" no período selecionado
        const { data: ordersData, error: ordersError } = await supabase
          .from('Order')
          .select('*, Client(name, id)')
          .eq('status', 'done')
          .gte('created_at', isoDataInicio)
          .lte('created_at', isoHoje);

        if (ordersError) throw ordersError;

        // Buscar produtos
        const { data: productsData, error: productsError } = await supabase
          .from('Product')
          .select('*, Category(name)');

        if (productsError) throw productsError;

        // Buscar pedidos de produtos
        const { data: orderProductsData, error: orderProductsError } = await supabase
          .from('OrderProducts')
          .select('*, Product(name, category), Variant(name, price)');

        if (orderProductsError) throw orderProductsError;

        // Buscar categorias
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('Category')
          .select('*');

        if (categoriesError) throw categoriesError;

        // Processar dados dos pedidos
        if (ordersData) {
          const totalVendas = ordersData.length;
          const receitaTotal = ordersData.reduce((sum, order) => sum + order.price, 0);
          const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;

          // Calcular evolução diária
          const pedidosPorDia = ordersData.reduce((acc, order) => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            acc[date] = acc[date] || { data: date, receita: 0, vendas: 0 };
            acc[date].receita += order.price;
            acc[date].vendas += 1;
            return acc;
          }, {});

          const vendasDiarias = Object.values(pedidosPorDia);
          vendasDiarias.sort((a: any, b: any) => a.data.localeCompare(b.data));

          let evolucaoPercentual = 0;
          if (vendasDiarias.length >= 2) {
            const primeira = (vendasDiarias[0] as any).receita;
            const ultima = (vendasDiarias[vendasDiarias.length - 1] as any).receita;
            evolucaoPercentual = primeira !== 0 ? ((ultima - primeira) / primeira * 100) : 0;
          }

          // Processar dados de clientes
          const clientesUnicos = new Set();
          const clienteStats: { [key: string]: { frequencia: number, receita: number } } = {};

          ordersData.forEach(order => {
            if (order.Client && order.Client.name) {
              const clientName = order.Client.name.toLowerCase().trim();
              clientesUnicos.add(clientName);
              
              if (!clienteStats[clientName]) {
                clienteStats[clientName] = { frequencia: 0, receita: 0 };
              }
              
              clienteStats[clientName].frequencia += 1;
              clienteStats[clientName].receita += order.price;
            }
          });

          const clienteStatsArray = Object.entries(clienteStats).map(([name, stats]) => ({
            nome: name,
            frequencia: stats.frequencia,
            receita: stats.receita
          }));

          // Cálculos para clientes
          const totalClientes = clienteStatsArray.length;
          const mediaFrequencia = totalClientes > 0 
            ? clienteStatsArray.reduce((sum, client) => sum + client.frequencia, 0) / totalClientes 
            : 0;
          const mediaReceita = totalClientes > 0
            ? clienteStatsArray.reduce((sum, client) => sum + client.receita, 0) / totalClientes
            : 0;

          // Melhor cliente
          let melhorCliente = { nome: "n/a", receita: 0 };
          if (clienteStatsArray.length > 0) {
            melhorCliente = clienteStatsArray.reduce((max, cliente) => 
              cliente.receita > max.receita ? cliente : max, { nome: "n/a", receita: 0 });
          }

          // Análise de produtos vendidos
          const produtosVendidos = orderProductsData?.reduce((acc, item) => {
            if (item.Product) {
              const productName = item.Product.name;
              acc[productName] = (acc[productName] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>) || {};

          const produtosVendidosArray = Object.entries(produtosVendidos)
            .map(([name, count]) => ({ nome: name, quantidade: count }))
            .sort((a, b) => b.quantidade - a.quantidade);

          // Análise de vendas por categoria
          const vendasPorCategoria = orderProductsData?.reduce((acc, item) => {
            if (item.Product && item.Product.category) {
              const categoryId = item.Product.category;
              const category = categoriesData?.find(cat => cat.id === categoryId);
              if (category) {
                const categoryName = category.name;
                acc[categoryName] = (acc[categoryName] || 0) + (item.Variant?.price || 0);
              }
            }
            return acc;
          }, {} as Record<string, number>) || {};

          const vendasPorCategoriaArray = Object.entries(vendasPorCategoria)
            .map(([name, value]) => ({ categoria: name, receita: value }))
            .sort((a, b) => b.receita - a.receita);

          // Combinações de produtos
          const pedidosProdutos: Record<string, string[]> = {};
          
          orderProductsData?.forEach(item => {
            if (item.order_id && item.Product) {
              if (!pedidosProdutos[item.order_id]) {
                pedidosProdutos[item.order_id] = [];
              }
              if (!pedidosProdutos[item.order_id].includes(item.Product.name)) {
                pedidosProdutos[item.order_id].push(item.Product.name);
              }
            }
          });

          const combinacoes: Record<string, number> = {};
          
          Object.values(pedidosProdutos).forEach(produtos => {
            if (produtos.length >= 2) {
              for (let i = 0; i < produtos.length; i++) {
                for (let j = i + 1; j < produtos.length; j++) {
                  const combo = [produtos[i], produtos[j]].sort().join(' + ');
                  combinacoes[combo] = (combinacoes[combo] || 0) + 1;
                }
              }
            }
          });

          const combinacoesArray = Object.entries(combinacoes)
            .map(([combo, count]) => ({ combo, quantidade: count }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 10);

          // Vendas por semana
          const hoje = new Date();
          const thisWeek = getWeekNumber(hoje);
          const lastWeek = thisWeek - 1;
          
          const vendasPorSemana = ordersData.reduce((acc, order) => {
            const orderDate = new Date(order.created_at);
            const weekNum = getWeekNumber(orderDate);
            
            if (weekNum === thisWeek || weekNum === lastWeek) {
              if (!acc[weekNum]) {
                acc[weekNum] = { receita: 0, contagem: 0 };
              }
              acc[weekNum].receita += order.price;
              acc[weekNum].contagem += 1;
            }
            
            return acc;
          }, {} as Record<number, { receita: number, contagem: number }>);

          const comparativoSemanal = [
            { semana: `Semana ${lastWeek}`, receita: vendasPorSemana[lastWeek]?.receita || 0, vendas: vendasPorSemana[lastWeek]?.contagem || 0 },
            { semana: `Semana ${thisWeek}`, receita: vendasPorSemana[thisWeek]?.receita || 0, vendas: vendasPorSemana[thisWeek]?.contagem || 0 }
          ];

          // Montar objeto com todos os dados processados
          setDashboardData({
            totalVendas,
            receitaTotal,
            ticketMedio,
            evolucaoPercentual,
            totalClientes,
            mediaFrequencia,
            mediaReceita,
            melhorCliente,
            vendasDiarias,
            produtosVendidos: produtosVendidosArray,
            vendasPorCategoria: vendasPorCategoriaArray,
            combinacoesProdutos: combinacoesArray,
            comparativoSemanal,
            periodoInicio: dataInicio,
            periodoFim: hoje
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Erro ao carregar dados analíticos",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [period, startDate, endDate, toast]);

  // Função auxiliar para obter o número da semana
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Painel</h1>
        <DateRangePicker 
          period={period}
          onPeriodChange={handlePeriodChange}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted"></CardHeader>
              <CardContent className="h-24 bg-muted mt-2"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {dashboardData ? (
            <div className="space-y-8">
              {/* Métricas principais */}
              <DashboardMetrics data={dashboardData} />
              
              {/* Análise de vendas semanais */}
              <WeeklySalesComparison data={dashboardData.comparativoSemanal} isLoading={isLoading} />

              {/* Análise de produtos com filtro de período */}
              <ProductAnalysis data={dashboardData.produtosVendidos} isLoading={isLoading} />

              {/* Distribuição de receita por categoria com filtro de período */}
              <CategoryRevenue data={dashboardData.vendasPorCategoria} isLoading={isLoading} />

              {/* Produtos mais vendidos juntos com filtro de período */}
              <ProductCombinations data={dashboardData.combinacoesProdutos} isLoading={isLoading} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total de itens no inventário
                  </p>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/products" className="flex items-center">
                        <span>Gerenciar Produtos</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categoryCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total de categorias de produtos
                  </p>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/categories" className="flex items-center">
                        <span>Gerenciar Categorias</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
                  <PlusCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild size="sm" className="w-full">
                    <Link to="/products/new" className="flex items-center justify-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Adicionar Novo Produto</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/categories/new" className="flex items-center justify-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Adicionar Nova Categoria</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
