
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklySalesComparisonProps {
  data: Array<{
    semana: string;
    receita: number;
    vendas: number;
  }>;
  isLoading?: boolean;
}

const WeeklySalesComparison: React.FC<WeeklySalesComparisonProps> = ({ data, isLoading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{label}</p>
          <p>{`Receita: ${formatCurrency(payload[0].value)}`}</p>
          <p>{`Vendas: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Comparativo de Vendas Semanal</h2>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Receita e Volume de Vendas</CardTitle>
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
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="receita" fill="#333333" name="Receita" />
                <Bar yAxisId="right" dataKey="vendas" fill="#f2f2f2" name="Vendas" />
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

export default WeeklySalesComparison;
