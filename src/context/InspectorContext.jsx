import React, { createContext, useContext, useState } from 'react';

const InspectorContext = createContext();

export const InspectorProvider = ({ children }) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isOpen, setIsOpen] = useState(false);

  const openInspector = (type, data, tab = 'overview') => {
    setSelectedEntity({ type, data });
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeInspector = () => {
    setIsOpen(false);
  };

  const setTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <InspectorContext.Provider
      value={{
        selectedEntity,
        activeTab,
        isOpen,
        openInspector,
        closeInspector,
        setTab,
      }}
    >
      {children}
    </InspectorContext.Provider>
  );
};

export const useInspector = () => useContext(InspectorContext);
