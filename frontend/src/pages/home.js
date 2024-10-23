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
import { io } from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';

const HomePage = () => {

  const [profileImageUrl, setProfileImageUrl] = useState('');

useEffect(() => {
    const user = JSON.parse(localStorage.getItem("compiler_user"));
    if (user) {
        const username = user.username.toUpperCase();
        const firstUrl = `https://thecodemind.io/app/studentpics/${username}.png`;
        const secondUrl = `https://info.aec.edu.in/adityacentral/studentphotos/${username}.jpg`;
        const thirdUrl = `data:image/png;base64,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`;

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
            } else if(checkImage(secondUrl).then((url) => {
                if (url) {
                    setProfileImageUrl(url);
                } else {
                    setProfileImageUrl(thirdUrl);
                }
            }));
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
  const user =JSON.parse(localStorage.getItem("compiler_user"))
  const userId = user.username
  // const userId = '22p35a0384'; // This should be the unique user ID

  useEffect(() => {
      // Connect to the server and pass the userId as a query parameter
      const socket = io(api, { query: { id: userId } });

      // Listen for 'dbUpdate' events
      socket.on('dbUpdate', async(data) => {
          console.log('Received database update:', data);
          const user =JSON.parse(localStorage.getItem("compiler_user"))
          try {
            const username = user.username
            const response = await axios.post(`${api}/allqns`,{username});
            setProblems(response.data);
          } catch (error) {
            console.error('Error fetching problems:', error);
          }
          
          // Handle the database update here (e.g., update the UI)
      });

      return () => {
          socket.disconnect();
      };
  }, []);

  // useEffect(() => {
  //   const user =JSON.parse(localStorage.getItem("compiler_user"))
  //   // Connect to the WebSocket server
  //   const socket = io(ENDPOINT, {
  //     query:{id:user.username}
  //   });

  //   // Listen for 'dbChange' event from the server
  //   socket.on('dbChange', async(change) => {
  //     console.log('Database change received:', change);
  //     try {
  //       const username = user.username
  //       const response = await axios.post(`${api}/allqns`,{username});
  //       setProblems(response.data);
  //     } catch (error) {
  //       console.error('Error fetching problems:', error);
  //     }

  //     // Update the state with the new change
  //     // setChanges((prevChanges) => [...prevChanges, change]);
  //   });

  //   // Clean up the connection when the component unmounts
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

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
