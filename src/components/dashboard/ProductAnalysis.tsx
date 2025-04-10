
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductAnalysisProps {
  data: Array<{
    nome: string;
    quantidade: number;
  }>;
  isLoading?: boolean;
}

const ProductAnalysis: React.FC<ProductAnalysisProps> = ({ data, isLoading }) => {
  // Limitar para os 10 produtos mais vendidos para melhor visualização
  const topProducts = data?.slice(0, 10) || [];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{label}</p>
          <p>{`Quantidade: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Análise de Produtos</h2>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Quantidade de Vendas por Produto</CardTitle>
          {topProducts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Produto Mais Vendido: {topProducts[0].nome} - {topProducts[0].quantidade} vendas
            </p>
          )}
        </CardHeader>
        <CardContent className="h-72 md:h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Carregando dados...</p>
            </div>
          ) : topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" fill="#333333" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductAnalysis;
