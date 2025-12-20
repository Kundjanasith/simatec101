import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import Header from '../components/Header';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page-container">
      <Header />
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
        <div className="floating-section" style={{ padding: '2rem', minWidth: '1000px' }}>
          {/* <Typography variant="h5" component="div" sx={{ textAlign: 'center', mb: 2, color: 'white' }}>
            Services
          </Typography> */}
          <Typography variant="h3" component="div" sx={{ textAlign: 'center', mb: 4, color: 'white', fontWeight: 'bold' }}>
            Explore Our Services
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button component={Link} to="/bioactivity" variant="contained" size="large" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              Bioactivity Test
            </Button>
            <Button component={Link} to="/membrane" variant="contained"  size="large" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              Membrane Interaction
            </Button>
            <Button component={Link} to="/formulation" variant="contained"  size="large" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              Formulation Design
            </Button>
          </Box>
        </div>
      </Box>
    </div>
  );
}

export default LandingPage;
