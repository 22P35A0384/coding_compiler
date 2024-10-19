import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Grid, Card, CardContent, CardActions, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../backendapi';

const BackgroundCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  backgroundImage: `url('https://geekflare.com/wp-content/uploads/2022/10/Coding.png')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: '#fff',
  height: '250px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRadius: '8px',
  boxShadow: theme.shadows[5],
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
  '& .MuiCardActions-root': {
    position: 'relative',
    zIndex: 1,
    justifyContent: 'center', // Center align the actions
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 0,
  },
}));

const ViewContestButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  textTransform: 'none',
}));

const ContestsPage = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get(`${api}/getcontests`);
        setContests(response.data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    fetchContests();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Available Contests
      </Typography>
      {/* <Button 
        variant="contained" 
        color="primary" 
        component={Link} 
        to="/createcontest"
        sx={{ 
          mb: 4, 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 1000 
        }}
        startIcon={<AddCircleOutlineIcon />}
      >
        New Contest
      </Button> */}
      <Grid container spacing={4}>
        {contests.map((contest) => (
          <Grid item xs={12} sm={6} md={4} key={contest._id}>
            <BackgroundCard>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {contest.name}
                </Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  {contest.description || 'No description available'}
                </Typography> */}
              </CardContent>
              <CardActions>
                <ViewContestButton 
                  size="small" 
                  component={Link} 
                  to={`/contest/${contest._id}`}
                >
                  View Contest
                </ViewContestButton>
              </CardActions>
            </BackgroundCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ContestsPage;
