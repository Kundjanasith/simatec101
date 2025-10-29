import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './Header';
import LeftPanel from './LeftPanel';
import Viewer from './Viewer';
import ResultsPanel from './ResultsPanel';
import LoadingOverlay from './LoadingOverlay';
import './App.css';

const DOCKING_SIMULATION_TIME = 3000; // 3 seconds for simulation

function App() {
  const [results, setResults] = useState([]); // Now stores [{ receptorName, ligandName, scores: [...], dockedFile: '...' }]
  const [selectedDockedFile, setSelectedDockedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const progressIntervalRef = useRef(null);
  const [selectedProteinForDisplay, setSelectedProteinForDisplay] = useState(null); // To pass to ResultsPanel

  const startSimulatedProgress = () => {
    setProgressPercentage(0);
    const increment = 1; // Increase by 1% at a time
    const intervalDuration = DOCKING_SIMULATION_TIME / 100; // Update every X ms for 100 increments
    let currentProgress = 0;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += increment;
      if (currentProgress < 99) {
        setProgressPercentage(Math.floor(currentProgress));
      } else {
        setProgressPercentage(99); // Cap at 99% until actual completion
      }
    }, intervalDuration);
  };

  const stopSimulatedProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const fetchResult = async (receptor, ligand) => {
    try {
      const receptorName = receptor.replace('.pdbqt', '');
      const ligandName = ligand.replace('.pdbqt', '');
      const resultFileName = `results_${ligandName}_${receptorName}.txt`;
      
      const response = await axios.get(`/results/${resultFileName}`);
      
      const parsedScores = response.data.split('\n').filter(line => line).map(line => {
        const [mode, affinity, rmsd_lb, rmsd_ub] = line.split(',');
        return {
          mode: parseInt(mode, 10),
          affinity: parseFloat(affinity),
          rmsd_lb: parseFloat(rmsd_lb),
          rmsd_ub: parseFloat(rmsd_ub),
        };
      });

      const dockedFileName = `/outputs/docked_${ligandName}_${receptorName}.pdbqt`;

      const newResult = {
        receptorName,
        ligandName,
        scores: parsedScores,
        dockedFile: dockedFileName,
      };

      setResults(prevResults => [...prevResults, newResult]);

      return { success: true, dockedFile: dockedFileName };
    } catch (err) {
      const errorMessage = `Could not fetch results for ${ligand.replace('.pdbqt', '')}.`;
      setError(errorMessage);
      console.error(err);
      return { success: false, error: errorMessage };
    }
  };

  const handleRunDocking = async (dockingRequests, selectedProteinInfo) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedDockedFile(null);
    setSelectedProteinForDisplay(selectedProteinInfo);
    startSimulatedProgress();

    const newDockedFiles = [];
    for (const request of dockingRequests) {
      const { receptor, ligand } = request;
      const result = await fetchResult(receptor, ligand);
      if (result.success) {
        newDockedFiles.push(result.dockedFile);
      } else {
        stopSimulatedProgress();
        setLoading(false);
        return; // Stop on first error
      }
    }

    // Set the viewer to the first result by default
    if (newDockedFiles.length > 0) {
      setSelectedDockedFile(newDockedFiles[0]);
    }

    stopSimulatedProgress();
    setProgressPercentage(100);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleSelectResult = (dockedFile) => {
    setSelectedDockedFile(dockedFile);
  };

  return (
    <div className="App">
      <Header />
      <div className="main-content">
        <LeftPanel onRunDocking={handleRunDocking} loading={loading} />
        <Viewer receptorFile={selectedDockedFile} />
        <ResultsPanel 
          results={results} 
          error={error} 
          selectedProtein={selectedProteinForDisplay}
          onSelectResult={handleSelectResult}
          selectedDockedFile={selectedDockedFile}
        />
      </div>
      {loading && <LoadingOverlay percentage={progressPercentage} />} 
    </div>
  );
}

export default App;