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

const Varilog = () => {
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
    
  const [Language, setLanguage] = useState('verilog');
  const [ScreenMode, setScreenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [codeContent, setCodeContent] = useState('');
  const [Custominput, setCustominput] = useState('');
  const [loading, setLoading] = useState(false);

  const Code = {
    "verilog": `module HelloWorld;\ninitial begin\n  $display("Hello, World!");\nend\nendmodule` 
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
      const response = await axios.post(`${api}/${Language}`, {
        code: codeContent,
        input: Custominput
      });

      const { output = '', error = '' } = response.data;
      const result = error ? `Error: ${escapeHtml(error)}` : escapeHtml(output || '');
      outputDiv.innerHTML = `<span>${result.replace(/\n/g, '<br />')}</span>`;
      // if (Language === 'python') {
      //   const response = await axios.post(`${api}/python`, {
      //     code: codeContent,
      //     input: Custominput
      //   });
  
      //   const { output = '', error = '' } = response.data;
      //   const result = error ? `Error: ${escapeHtml(error)}` : escapeHtml(output || '');
      //   outputDiv.innerHTML = `<span>${result.replace(/\n/g, '<br />')}</span>`;
  
      // } else if (Language === 'javascript') {
      //   const response = await axios.post(`${api}/javascript`, {
      //     code: codeContent,
      //     input: Custominput
      //   });
  
      //   const { output = '', error = '' } = response.data;
      //   const result = error ? `Error: ${escapeHtml(error)}` : escapeHtml(output || '');
      //   outputDiv.innerHTML = `<span>${result.replace(/\n/g, '<br />')}</span>`;
      // } else {
      //   outputDiv.innerHTML = `<span style="color: red;">Execution for ${Language} is not supported in the browser.</span>`;
      // }
    } catch (error) {
      outputDiv.innerHTML = `<span style="color: red;">Error: ${escapeHtml(error.message)}</span>`;
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
              <MenuItem value={'verilog'}>Verilog</MenuItem>
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

export default Varilog;
