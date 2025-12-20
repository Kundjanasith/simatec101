import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import BioactivityTests from './pages/BioactivityTests';
import MembraneInteraction from './pages/MembraneInteraction';
import FormulationDesign from './pages/FormulationDesign';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/bioactivity" element={<Layout><BioactivityTests /></Layout>} />
      <Route path="/membrane" element={<Layout><MembraneInteraction /></Layout>} />
      <Route path="/formulation" element={<Layout><FormulationDesign /></Layout>} />
    </Routes>
  );
}

export default App;
