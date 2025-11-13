import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './Header';
import LeftPanel from './LeftPanel';
import Viewer from './Viewer';
import ResultsPanel from './ResultsPanel';
import LoadingOverlay from './LoadingOverlay';
import './App.css';

const DOCKING_SIMULATION_TIME = 3000; // 3 seconds for simulation

// This mapping connects the receptor file to the prefix used in the output files.
const proteinToPrefix = {
  'Anti-inflammation.pdbqt': 'COX-2',
  'Anti-amylase.pdbqt': 'Amylase',
  'Anti-glucosidase.pdbqt': 'Glucosidase',
  'Anti-lipase.pdbqt': 'Lipase',
  'Anti-carnosinase.pdbqt': 'Carnosinase'
};

function App() {
  const [results, setResults] = useState([]);
  const [selectedDockedFiles, setSelectedDockedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const progressIntervalRef = useRef(null);
  const [selectedProteinForDisplay, setSelectedProteinForDisplay] = useState(null);

  const startSimulatedProgress = () => {
    setProgressPercentage(0);
    const increment = 1;
    const intervalDuration = DOCKING_SIMULATION_TIME / 100;
    let currentProgress = 0;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += increment;
      if (currentProgress < 99) {
        setProgressPercentage(Math.floor(currentProgress));
      } else {
        setProgressPercentage(99);
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
    const receptorBaseName = receptor.split('/').pop();
    const proteinPrefix = proteinToPrefix[receptorBaseName];
    
    if (!proteinPrefix) {
      const errorMsg = `Configuration error: No prefix found for receptor ${receptorBaseName}`;
      setError(errorMsg);
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const ligandNames = ligands.map(l => l.replace('.pdbqt', ''));
    const ligandNameForDisplay = ligandNames.join(' & ');

    const resultFilenameBody = `${proteinPrefix}_${ligandNames.join('_')}`;
    const resultFileName = `/tem03_out/results/${resultFilenameBody}.txt`;
    const dockedFileName = `/tem03_out/outputs/${resultFilenameBody}.pdbqt`;

    console.log("fetchDockingResult: Corrected result file path:", resultFileName);
    console.log("fetchDockingResult: Corrected docked file path:", dockedFileName);

    try {
      const response = await axios.get(process.env.PUBLIC_URL + resultFileName);
      const parsedScores = response.data.split('\n').filter(line => line).map(line => {
        const [mode, affinity, rmsd_lb, rmsd_ub] = line.split(',');
        return {
          mode: parseInt(mode, 10),
          affinity: parseFloat(affinity),
          rmsd_lb: parseFloat(rmsd_lb),
          rmsd_ub: parseFloat(rmsd_ub),
        };
      });

      const bestScore = parsedScores.sort((a, b) => a.affinity - b.affinity)[0];

      const newResult = {
        receptorName: receptor.replace('.pdbqt', ''),
        ligandName: ligandNameForDisplay,
        scores: parsedScores,
        dockedFile: dockedFileName,
        bestAffinity: bestScore ? bestScore.affinity : Infinity,
        originalLigandFile: `/data/ligands/${ligands[0]}`, // Assuming ligands array always has one element here
      };

      return { success: true, result: newResult };

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

    const allFetchedResults = [];
    let ligandForViewer = null;

    for (const request of dockingRequests) {
      const { receptor, ligands } = request;

      if (ligands.length > 1) {
        const individualLigandResults = [];
        for (const ligand of ligands) {
          const fetchResult = await fetchDockingResult(receptor, [ligand]);
          if (fetchResult.success) {
            individualLigandResults.push(fetchResult.result);
            allFetchedResults.push(fetchResult.result);
          } else {
            stopSimulatedProgress();
            setLoading(false);
            return;
          }
        }

        if (individualLigandResults.length > 0) {
          const lowestAffinityLigandResult = individualLigandResults.sort(
            (a, b) => a.bestAffinity - b.bestAffinity
          )[0];
          ligandForViewer = lowestAffinityLigandResult.originalLigandFile;
        }

      } else {
        const fetchResult = await fetchDockingResult(receptor, ligands);
        if (fetchResult.success) {
          allFetchedResults.push(fetchResult.result);
          ligandForViewer = fetchResult.result.dockedFile;
        } else {
          stopSimulatedProgress();
          setLoading(false);
          return;
        }
      }
    }

    setResults(allFetchedResults);
    setSelectedDockedFiles(ligandForViewer ? [ligandForViewer] : []);

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
            // This logic seems to be for deciding whether to show the receptor at all, which is fine.
            const rFile = selectedProteinForDisplay ? `/data/receptors/${selectedProteinForDisplay.protein}` : null;
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
