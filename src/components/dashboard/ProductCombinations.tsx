
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductCombinationsProps {
  data: Array<{
    combo: string;
    quantidade: number;
  }>;
  isLoading?: boolean;
}

const ProductCombinations: React.FC<ProductCombinationsProps> = ({ data, isLoading }) => {
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
      <h2 className="text-xl font-semibold">Produtos Mais Vendidos Juntos</h2>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Combinações de Produtos</CardTitle>
        </CardHeader>
        <CardContent className="h-72 md:h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Carregando dados...</p>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="combo" 
                  width={150}
                  tick={{ fontSize: 11 }}
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

export default ProductCombinations;
