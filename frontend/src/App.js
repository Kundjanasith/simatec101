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
  const [selectedDockedFiles, setSelectedDockedFiles] = useState([]);
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

  const fetchDockingResult = async (receptor, ligands) => {
    const receptorName = receptor.replace('.pdbqt', '');
    const ligandNames = ligands.map(l => l.replace('.pdbqt', ''));

    let resultFileName;
    let dockedFileName;
    let ligandNameForDisplay;
    let basePath = '/data'; // Default path
    let actualReceptorNameInPath = receptorName; // Use this for constructing file paths

    if (receptorName === 'COX-2' || receptorName === 'Anti-lipase') {
      basePath = '/tem02_out';
      if (receptorName === 'Anti-lipase') {
        actualReceptorNameInPath = 'Lipase'; // Adjust for the specific file naming convention
      }
    }

    console.log("fetchDockingResult: receptorName:", receptorName);
    console.log("fetchDockingResult: ligandNames:", ligandNames);
    console.log("fetchDockingResult: basePath:", basePath);
    console.log("fetchDockingResult: actualReceptorNameInPath:", actualReceptorNameInPath);

    if (ligandNames.length === 1) {
      ligandNameForDisplay = ligandNames[0];
      resultFileName = `${basePath}/results/${actualReceptorNameInPath}_${ligandNames[0]}.txt`;
      dockedFileName = `${basePath}/outputs/${actualReceptorNameInPath}_${ligandNames[0]}.pdbqt`;
    } else if (ligandNames.length === 2) {
      ligandNameForDisplay = ligandNames.join(' & ');
      resultFileName = `${basePath}/results/${actualReceptorNameInPath}_${ligandNames[0]}_${ligandNames[1]}.txt`;
      dockedFileName = `${basePath}/outputs/${actualReceptorNameInPath}_${ligandNames[0]}_${ligandNames[1]}.pdbqt`;
    } else {
      return { success: false, error: 'Invalid number of ligands.' };
    }

    console.log("fetchDockingResult: constructed resultFileName:", resultFileName);
    console.log("fetchDockingResult: constructed dockedFileName:", dockedFileName);

    try {
      const response = await axios.get(process.env.PUBLIC_URL + resultFileName);
      console.log("fetchDockingResult: Successfully fetched result file:", process.env.PUBLIC_URL + resultFileName);
      const parsedScores = response.data.split('\n').filter(line => line).map(line => {
        const [mode, affinity, rmsd_lb, rmsd_ub] = line.split(',');
        return {
          mode: parseInt(mode, 10),
          affinity: parseFloat(affinity),
          rmsd_lb: parseFloat(rmsd_lb),
          rmsd_ub: parseFloat(rmsd_ub),
        };
      });

      const newResult = {
        receptorName,
        ligandName: ligandNameForDisplay,
        scores: parsedScores,
        dockedFile: dockedFileName,
      };

      setResults(prevResults => [...prevResults, newResult]);
      return { success: true, dockedFile: dockedFileName };

    } catch (err) {
      const errorMessage = `Could not fetch results for ${ligandNameForDisplay}.`;
      setError(errorMessage);
      console.error("fetchDockingResult: Error fetching result file:", process.env.PUBLIC_URL + resultFileName, err);
      return { success: false, error: errorMessage };
    }
  };

  const handleRunDocking = async (dockingRequests, selectedProteinInfo) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedDockedFiles([]);
    setSelectedProteinForDisplay(selectedProteinInfo);
    startSimulatedProgress();

    const newDockedFiles = [];
    for (const request of dockingRequests) {
      const { receptor, ligands } = request; // Adjusted to new structure
      const result = await fetchDockingResult(receptor, ligands); // Use the new function
      if (result.success) {
        newDockedFiles.push(result.dockedFile);
      } else {
        stopSimulatedProgress();
        setLoading(false);
        return; // Stop on first error
      }
    }

    // Set the viewer to the first result by default
    setSelectedDockedFiles(newDockedFiles);

    stopSimulatedProgress();
    setProgressPercentage(100);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleSelectResult = (dockedFile) => {
    setSelectedDockedFiles([dockedFile]);
  };

  return (
    <div className="App">
      <Header />
      <div style={{marginTop: 0, paddingTop: 0}} className="main-content">
        <LeftPanel onRunDocking={handleRunDocking} loading={loading} />
        <Viewer 
          receptorFile={(() => {
            const rFile = selectedProteinForDisplay && 
              selectedProteinForDisplay.protein !== 'COX-2.pdbqt' &&
              selectedProteinForDisplay.protein !== 'Anti-lipase.pdbqt'
                ? `/data/receptors/${selectedProteinForDisplay.protein}` 
                : null;
            console.log("App: Passing receptorFile to Viewer:", rFile);
            return rFile;
          })()} 
          ligandFiles={(() => {
            console.log("App: Passing ligandFiles to Viewer:", selectedDockedFiles);
            return selectedDockedFiles;
          })()} 
        />
        <ResultsPanel 
          results={results} 
          error={error} 
          selectedProtein={selectedProteinForDisplay}
          onSelectResult={handleSelectResult}
          selectedDockedFiles={selectedDockedFiles}
        />
      </div>
      {loading && <LoadingOverlay percentage={progressPercentage} />} 
    </div>
  );
}

export default App;