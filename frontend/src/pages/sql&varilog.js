import React, { useEffect, useState } from 'react';
import { Editor } from "@monaco-editor/react";
import Styles from "../css/compiler.module.css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LightModeIcon from '@mui/icons-material/LightMode';
import CachedIcon from '@mui/icons-material/Cached';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Button, Select, MenuItem } from "@mui/material";
import axios from 'axios'; // Import axios for API requests
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';
import api from '../backendapi';

const SqlandVarilog = () => {
    const navigate = useNavigate()
    const [userName, setUsername] = useState('')
    useEffect(()=>{
        const user =JSON.parse(localStorage.getItem("compiler_user"))
        if(!user){
            navigate("/login")
        }else{
            setUsername(user.username)
        }
    },[])
    
  const [Language, setLanguage] = useState('sql');
  const [ScreenMode, setScreenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [codeContent, setCodeContent] = useState('');
  const [Custominput, setCustominput] = useState('');
  const [loading, setLoading] = useState(false);

  const Code = {
    "sql":`SELECT * FROM yourTable WHERE id = ?`
};

  useEffect(() => {
    setCodeContent(Code[Language]);
  }, [Language]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  useEffect(() => {
    setIsRunning(true);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleRunCode = async () => {
    const outputDiv = document.getElementById('output');
    if (!outputDiv) {
      console.error("Output element not found");
      return;
    }

    setLoading(true);
    
    // Clear previous output
    outputDiv.innerHTML = '';
  
    try {
        // Sending code and custom input to the backend
        const response = await axios.post(`${api}/problemcompiler/${Language}`, {
            code: codeContent,
            input: Custominput,
            userId : userName
        });
    
        const { success, data, message, error } = response.data;  // Destructuring response data
    
        let successVal = success !== undefined ? success : '-';
        let errorVal = error !== undefined ? error : '-';
        let messageVal = message !== undefined ? message : '-';
    
        // Create table structure for the response
        let tableContent = `
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Success</th>
                        <th>Error</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${escapeHtml(String(successVal))}</td>
                        <td style="color: red;">${escapeHtml(String(errorVal))}</td>
                        <td style="color: red;">${escapeHtml(String(messageVal))}</td>
                    </tr>
                </tbody>
            </table>`;
    
        // Check if there is data to display (for successful SQL queries)
if (data && data.length > 0) {
    // Convert the data to a JSON string and format it
    const jsonData = JSON.stringify(data, null, 2); // Indents with 2 spaces for readability

    // Display the formatted JSON string in an HTML element
    tableContent += `<pre>${escapeHtml(jsonData)}</pre>`;
        } else if (success) {
            // If success but no data, display a message
            tableContent += `
                <table border="1" cellpadding="5" cellspacing="0">
                    <thead>
                        <tr><th>No Data Available</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>No results found for the query.</td></tr>
                    </tbody>
                </table>`;
        }
    
        outputDiv.innerHTML = tableContent;  // Display the table in the outputDiv
    
    } catch (error) {
        // Handling unexpected errors (e.g., network or server issues)
        let errorVal = error.response ? error.response.data.error : error.message;
        let messageVal = error.response ? error.response.data.message : 'Internal Server Error';
    
        outputDiv.innerHTML = `
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Success</th>
                        <th>Error</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>-</td>
                        <td style="color: red;">${escapeHtml(errorVal || '-')}</td>
                        <td style="color: red;">${escapeHtml(messageVal || '-')}</td>
                    </tr>
                </tbody>
            </table>`;
    }
    
    
    
    
    

    setLoading(false);
  };

  const handleResetCode = () => {
    setTimer(0);
    setIsRunning(true);
    setCodeContent(Code[Language]);
  };

  const toggleFullscreen = () => {
    const editorElement = document.querySelector(`.${Styles.main}`);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      editorElement.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const Userinput = (e) => {
    setCustominput(e.target.value);
  };

  return (
    <div className={Styles.main}>
      <div className={Styles.left}>
        <div className={Styles.head}>
          <div>
            <Select
              style={{ height: '38px' }}
              value={Language}
              onChange={(event) => setLanguage(event.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="">
                <em>Language</em>
              </MenuItem>
              {/* <MenuItem value={'varilog'}>Varilog</MenuItem> */}
              <MenuItem value={'sql'}>SQL</MenuItem>
            </Select>
          </div>
          <div className={Styles.headright}>
            <h5 className={Styles.time} style={{ color: isFullscreen && !ScreenMode ? 'white' : 'inherit' }}>
              {formatTime(timer)}
            </h5>
            {ScreenMode ? 
              <div onClick={() => setScreenMode(false)}>
                <DarkModeIcon style={{cursor:'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit'}}/>
              </div> 
              : 
              <div onClick={() => setScreenMode(true)}>
                <LightModeIcon style={{cursor:'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit'}}/>
              </div>
            }
            <CachedIcon style={{cursor:'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit'}} onClick={handleResetCode}/>
            {isFullscreen ? 
              <FullscreenExitIcon style={{cursor:'pointer', color: 'white'}} onClick={toggleFullscreen}/> 
              : 
              <FullscreenIcon style={{cursor:'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit'}} onClick={toggleFullscreen}/>
            }
            {/* <Button className={Styles.runbtn1} variant="outlined" endIcon={<PlayArrowIcon />} onClick={handleRunCode}>Run Code</Button> */}
            <Button
                className={Styles.runbtn1}
                variant="outlined"
                endIcon={loading ? null : <PlayArrowIcon />}
                disabled={loading}
                onClick={handleRunCode}
                >
                {loading ? <div className={Styles.spinner}></div> : 'Run Code'}
              </Button>
              {/* <Button className={Styles.runbtn2} variant="outlined" onClick={handleRunCode}><PlayArrowIcon /></Button> */}
              <Button
                className={Styles.runbtn2}
                variant="outlined"
                // endIcon={loading ? null : <PlayArrowIcon />}
                disabled={loading}
                onClick={handleRunCode}
                >
                {loading ? <div className={Styles.spinner}></div> : <PlayArrowIcon/>}
              </Button>
          </div>
        </div>
        <div style={{border:'1px solid black'}}>
          <Editor
            height='90svh'
            width="100%"
            theme={ScreenMode ? "vs-light" : "vs-dark"}
            language={Language}
            value={codeContent}
            onChange={(newValue) => setCodeContent(newValue)}
          />
        </div>
      </div>
      <div className={Styles.right}>
        <Button
            className={Styles.backbtn}
            variant="outlined"
            startIcon= {<ArrowBackIosIcon />}
            onClick={()=>{navigate('/home')}}
            >
            Back TO Home
        </Button>
        <div className={Styles.input}>
          <div className={Styles.inputhead}>
            <h2>Custom Input :</h2>
          </div>
          <div className={Styles.inputbody}>
            <textarea onChange={Userinput} className={Styles.inputinput} />
          </div>
        </div>
        <div className={Styles.console}>
          <div className={Styles.consolehead}>
            <h2>Output :</h2>
          </div>
          <div className={Styles.consolebody}>
            <div id="output" className={Styles.consoleresult}>
              {/* Output will be displayed here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlandVarilog;
