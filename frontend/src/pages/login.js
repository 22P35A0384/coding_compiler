import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import api from '../backendapi';
import Alert from '@mui/material/Alert';
import Lottie from 'lottie-react';
import animationData from "../animations/rNrca04TXS.json"; 

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("compiler_user"));
        if (user) {
            navigate('/home');
        }
    }, [navigate]);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [invaliduser, setinvaliduser] = useState(false);
    const [invalidpassword, setinvalidpassword] = useState(false);
    const [servererror, setservererror] = useState(false);
    const [loading, setloading] = useState(false)

    const handleSubmit = async(event) => {
        event.preventDefault();
        setinvaliduser(false)
        setinvalidpassword(false)
        setservererror(false)
        setloading(true)
        try{
          await axios.post(`${api}/login`,{username,password}).then((res)=>{
            if(res.data.msg===false){
              setinvaliduser(true)
            }else if(res.data===false){
              setinvalidpassword(true)
            }else if(res.data===true){
              setinvaliduser(false)
              setinvalidpassword(false)
              setservererror(false)
              localStorage.setItem("compiler_user", JSON.stringify({ username }));
              navigate('/home');
            }else{
              setservererror(true)
            }
          })
        }catch(err){
          console.log(err)
          setservererror(true)
        }finally{
          setloading(false)
        }
    };

    return (
      <>
         {loading &&
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '999999999999999',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'transparent',
                    backdropFilter: "blur(5px) brightness(50%)",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        autoplay={true}
                    />
                </div>
          }
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Login
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Roll Number"
                        name="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    />
                    { invaliduser && <Alert severity="error">Invalid Rollnumber! || Acount Not Found!</Alert> }
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    { invalidpassword && <Alert severity="error">Invalid Password!!!</Alert> }
                    { servererror && <Alert severity="error">Somethimg Went Wrong, Please Try Again!</Alert> }
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>
                </Box>
                <p>Don't Have An Account? <a href='/signup'>Signup Now</a></p>
            </Box>
        </Container>
      </>
    );
};

export default Login;
