import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import api from '../backendapi';
import Lottie from 'lottie-react';
import animationData from "../animations/rNrca04TXS.json"; 

const Signup = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('compiler_user'));
        if (user) {
            navigate('/home');
        }
    }, [navigate]);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isVerifyBtnVisible, setIsVerifyBtnVisible] = useState(true);
    const [isOtpInputVisible, setIsOtpInputVisible] = useState(false);
    const [isOtpSuccessVisible, setIsOtpSuccessVisible] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [otpHelperText, setOtpHelperText] = useState('');
    const [otpaxioserror, setotpaxioserror] = useState(false);
    const [loading, setloading] = useState(false);
    const [invalidotp, setinvalidotp] = useState(false);
    const [emailnotverified, setemailnotverified] = useState(false);

    // Validate and handle the submission of the form
    const handleSubmit = async(event) => {
        event.preventDefault();

        let isValid = true;

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (password.trim() === '' || !passwordRegex.test(password)) {
            setPasswordError(true);
            isValid = false;
        } else {
            setPasswordError(false);
        }

        // Confirm password validation
        if (confirmPassword.trim() === '' || password !== confirmPassword) {
            setConfirmPasswordError(true);
            isValid = false;
        } else {
            setConfirmPasswordError(false);
        }

        if(!isOtpSuccessVisible){
            setemailnotverified(true);
            isValid = false;
        }else {
            setemailnotverified(false);
        }

        // If everything is valid, store the user and navigate to home
        if (isValid) {
            setloading(true)
            try{
                await axios.post(`${api}/newuser`,{username:username.toLowerCase(),email,password}).then((res)=>{
                    if(res.data.msg===2){
                        alert("Account Created Sucessfully!!!")
                        navigate("/login")
                    }else if(res.data.msg===1){
                        alert("You Already Have A Account, Please Login")
                        navigate("/login")
                    }else{
                        alert("Something Went Wrong Please Try Again...")
                    }
                })
            }catch(err){
                console.log(err)
                alert("Something Went Wrong Please Try Again")
            }finally{
                setloading(false)
            }
        }
    };

    // Validate username and email when verifying the email
    const handleVerifyEmail = async () => {
        let isValid = true;
        const x = username.toLowerCase()
        const y = email.split("@")
        const z = y[0].toLowerCase()
        // Username validation
        if (username.trim() === '' || username.length !== 10) {
            setUsernameError(true);
            isValid = false;
        } else {
            setUsernameError(false);
        }

        // Email validation
        if (email.trim() === '' || x !== z) {
            setEmailError(true);
            isValid = false;
        } else {
            setEmailError(false);
        }

        // If both username and email are valid, proceed to show OTP input
        if (isValid) {
            setloading(true)
            try {
                const res = await axios.post(`${api}/otp`, { email });
                if (res.data) {
                    setemailnotverified(false);
                    setotpaxioserror(false);
                    setIsVerifyBtnVisible(false);
                    setIsOtpInputVisible(true);
                } else {
                    setotpaxioserror(true);
                }
            } catch (err) {
                console.log(err);
            }finally{
                setloading(false)
            }
        }
    };

    const handleOtpSubmit = async() => {
        if (otp.length !== 6) {
            setOtpError(true);
            setOtpHelperText('Please enter a 6-digit OTP');
            return;
        }
        setOtpError(false);
        setOtpHelperText('');
        setloading(true)
        try {
            await axios.post(`${api}/verifyotp`,{otp,email}).then((res)=>{
                if(res.data){
                    setinvalidotp(false)
                    setIsOtpInputVisible(false);
                    setIsOtpSuccessVisible(true);
                    setemailnotverified(false);
                }else{
                    setinvalidotp(true)
                }
            })
        } catch (err) {
            console.log(err);
        }finally{
            setloading(false)
        }
    };

    const handleOtpChange = (event) => {
        const value = event.target.value;
        if (value.length <= 6) {
            setOtp(value);
            setOtpError(false); // Reset error on change
            setOtpHelperText(''); // Clear helper text on change
        }
    };

    return (
        <>
            {loading ?
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
                        loop={true} // Set to true if you want the animation to loop
                        autoplay={true} // Set to true if you want the animation to start automatically
                    />
                </div>
                : ""
            }
            <Container maxWidth="sm">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
                    <Typography variant="h4" gutterBottom>
                        Signup
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
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setUsernameError(false);
                            }}
                            error={usernameError}
                            helperText={usernameError ? 'Invalid Roll Number' : ''}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="College Email Address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError(false);
                            }}
                            error={emailError}
                            helperText={emailError ? 'Invalid College Email' : ''}
                        />
                        {emailnotverified && <Alert severity="error">Email Is Not Yet Verified!</Alert>}

                        {isVerifyBtnVisible && (
                            <>
                                <Button
                                    onClick={handleVerifyEmail}
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Verify Email
                                </Button>
                                {otpaxioserror && <Alert severity="error">Something Went Wrong, Please Try Again</Alert>}
                            </>
                        )}

                        {isOtpInputVisible && (
                            <>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="otp"
                                    label="Enter Your OTP"
                                    name="otp"
                                    type="number"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    error={otpError}
                                    helperText={otpError ? otpHelperText : ''}
                                    inputProps={{ maxLength: 6 }}
                                />
                                 {invalidotp && <Alert severity="error">Invalid OTP!</Alert>}
                                <Button
                                    onClick={handleOtpSubmit}
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Submit OTP
                                </Button>
                            </>
                        )}

                        {isOtpSuccessVisible && (
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                disableElevation
                                sx={{ mt: 3, mb: 2 }}
                                startIcon={<CheckCircleOutlineIcon />}
                            >
                                OTP verified successfully!
                            </Button>
                        )}

                        <TextField
                            margin="normal"
                            fullWidth
                            id="password"
                            label="Password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setPasswordError(false);
                            }}
                            error={passwordError}
                            helperText={
                                passwordError
                                    ? 'Password must be at least 8 characters, include one uppercase, one lowercase, one number, and one special character'
                                    : ''
                            }
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            id="confirmPassword"
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setConfirmPasswordError(false);
                            }}
                            error={confirmPasswordError}
                            helperText={confirmPasswordError ? 'Passwords must match' : ''}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                    <p>Already Have An Account? <a href='/login'>Login Now</a></p>
                </Box>
            </Container>
        </>
    );
};

export default Signup;
