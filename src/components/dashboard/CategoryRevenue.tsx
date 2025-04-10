
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryRevenueProps {
  data: Array<{
    categoria: string;
    receita: number;
  }>;
  isLoading?: boolean;
}

const CategoryRevenue: React.FC<CategoryRevenueProps> = ({ data, isLoading }) => {
  const COLORS = ['#333333', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#F5F5F5'];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{payload[0].name}</p>
          <p>{`Receita: ${formatCurrency(payload[0].value)}`}</p>
          <p>{`${(payload[0].percent * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Distribuição de Receita por Categoria</h2>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Receita por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-72 md:h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Carregando dados...</p>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="receita"
                  nameKey="categoria"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>} />
              </PieChart>
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

export default CategoryRevenue;
