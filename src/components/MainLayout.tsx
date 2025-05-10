import React from 'react';
import Sidebar from './Sidebar';
import CentralWorkspace from './CentralWorkspace';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Sidebar variant="subtractive" />
      <CentralWorkspace />
      <Sidebar variant="additive" />
    </div>
  );
};

export default MainLayout;
