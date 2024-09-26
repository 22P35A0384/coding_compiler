import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Grid, Card, CardContent, CardActions } from '@mui/material';
// import { AddCircle as AddCircleIcon, Create as CreateIcon } from '@mui/icons-material';
import axios from 'axios'; // Make sure axios is installed
import styles from '../css/home.module.css'; // Adjust the path to your CSS file
import { useNavigate } from 'react-router-dom';
import TerminalIcon from '@mui/icons-material/Terminal';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../backendapi';

const HomePage = () => {
  const [profileImageUrl, setProfileImageUrl] = useState('');

useEffect(() => {
    const user = JSON.parse(localStorage.getItem("compiler_user"));
    if (user) {
        const username = user.username.toUpperCase();
        const firstUrl = `https://thecodemind.io/app/studentpics/${username}.png`;
        const secondUrl = `https://info.aec.edu.in/adityacentral/studentphotos/${username}.jpg`;

        const checkImage = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = () => resolve(null);
                img.src = url;
            });
        };

        checkImage(firstUrl).then((url) => {
            if (url) {
                setProfileImageUrl(url);
            } else {
                setProfileImageUrl(secondUrl);
            }
        });
    }
}, []);

    const navigate = useNavigate();
    const [userName, setUsername] = useState('')
    useEffect(()=>{
        const user =JSON.parse(localStorage.getItem("compiler_user"))
        if(!user){
            navigate("/login")
        }else{
            setUsername(user.username)
        }
    },[])
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const user =JSON.parse(localStorage.getItem("compiler_user"))
        const username = user.username
        const response = await axios.post(`${api}/allqns`,{username});
        setProblems(response.data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    fetchProblems();
  }, []);

  const handleSolve = (id,n) => {
    navigate(`/editor/${n}/${id}`);
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h6" className={styles.userName}>
          <img src={`${profileImageUrl}`} alt='Student Image' className={styles.profile}/>
          Welcome {userName},
        </Typography>
        <Box className={styles.buttonGroup}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TerminalIcon />}
            className={styles.addButton}
            onClick={()=>{navigate('/compiler')}}
          >
            Compiler
          </Button>
          {/* <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleIcon />}
            className={styles.addButton}
            onClick={()=>{navigate('/addproblem')}}
          >
            Add New Question
          </Button> */}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AssessmentIcon />}
            className={styles.createButton}
            onClick={()=>{navigate('/contests')}}
          >
            Contests
          </Button>
          <Button
            variant="contained"
            color="error"
            endIcon={<LogoutIcon />}
            className={styles.createButton}
            onClick={()=>{navigate('/logout')}}
          >
            Logout
          </Button>
        </Box>
      </Box>
      <Grid container spacing={2} className={styles.problemList}>
        {problems.map((problem, i) => (
          <Grid item xs={12} sm={6} md={4} key={problem._id}>
            <Card className={styles.problemCard}>
              <CardContent style={{textAlign:'left'}}>
                <Typography variant="h5" style={{color:'white'}}>
                  Question {i+1}
                </Typography>
                <Typography variant="h6" style={{color:'white'}}>
                  {problem.problemStatement}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color={problem.solved ? "success" : "primary"}
                  onClick={() => handleSolve(problem.id,i+1)}
                >
                  {problem.solved ? "Solved" : "Solve"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage;
