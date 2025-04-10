
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateRangePickerProps {
  period: string;
  onPeriodChange: (period: string) => void;
  startDate?: Date;
  endDate?: Date;
  onDateChange?: (start: Date | undefined, end: Date | undefined) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onDateChange,
}) => {
  const [date, setDate] = React.useState<Date | undefined>(startDate);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    if (period === 'custom' && onDateChange && selectedDate) {
      if (!startDate) {
        // First selection sets the start date
        onDateChange(selectedDate, undefined);
      } else if (!endDate) {
        // Second selection sets the end date (ensure it's not before start date)
        const endDt = selectedDate < startDate ? startDate : selectedDate;
        const startDt = selectedDate < startDate ? selectedDate : startDate;
        onDateChange(startDt, endDt);
      } else {
        // Reset selection on third click
        onDateChange(selectedDate, undefined);
      }
    }
  };

  const handlePeriodChange = (value: string) => {
    onPeriodChange(value);
    setDate(undefined);
    
    if (value !== 'custom' && onDateChange) {
      onDateChange(undefined, undefined);
    }
  };

  const dateRangeText = () => {
    if (period !== 'custom') {
      return '';
    }
    
    if (startDate && endDate) {
      return `${format(startDate, 'dd/MM/yy')} - ${format(endDate, 'dd/MM/yy')}`;
    } else if (startDate) {
      return `${format(startDate, 'dd/MM/yy')} - Selecione`;
    } else {
      return 'Selecione datas';
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
      <Select
        value={period}
        onValueChange={handlePeriodChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="week">Última Semana</SelectItem>
          <SelectItem value="month">Último Mês</SelectItem>
          <SelectItem value="custom">Período Personalizado</SelectItem>
        </SelectContent>
      </Select>
      
      {period === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-start text-left">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRangeText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              locale={ptBR}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DateRangePicker;
