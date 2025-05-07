
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';
import { useDataVisibility } from '@/contexts/DataVisibilityContext';

const DataVisibilityToggle: React.FC = () => {
  const { isDataVisible, toggleDataVisibility } = useDataVisibility();

  return (
    <Button 
      variant="outline" 
      onClick={toggleDataVisibility} 
      className="ml-2"
    >
      {isDataVisible ? (
        <>
          <EyeOff className="mr-2 h-4 w-4" />
          <span>Ocultar Dados</span>
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          <span>Mostrar Dados</span>
        </>
      )}
    </Button>
  );
};

export default DataVisibilityToggle;
