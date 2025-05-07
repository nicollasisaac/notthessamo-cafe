
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataVisibilityContextType {
  isDataVisible: boolean;
  toggleDataVisibility: () => void;
}

const DataVisibilityContext = createContext<DataVisibilityContextType | undefined>(undefined);

export const DataVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isDataVisible, setIsDataVisible] = useState<boolean>(true);

  const toggleDataVisibility = () => {
    setIsDataVisible(prev => !prev);
  };

  return (
    <DataVisibilityContext.Provider value={{ isDataVisible, toggleDataVisibility }}>
      {children}
    </DataVisibilityContext.Provider>
  );
};

export const useDataVisibility = (): DataVisibilityContextType => {
  const context = useContext(DataVisibilityContext);
  if (context === undefined) {
    throw new Error('useDataVisibility must be used within a DataVisibilityProvider');
  }
  return context;
};
