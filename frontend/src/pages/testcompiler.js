import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import Styles from "../css/compiler.module.css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LightModeIcon from '@mui/icons-material/LightMode';
import CachedIcon from '@mui/icons-material/Cached';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Button, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Piston = () => {
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
    const [Language, setLanguage] = useState('python');
    const [ScreenMode, setScreenMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [codeContent, setCodeContent] = useState('');
    const [Custominput, setCustominput] = useState('')

    const Code = {
        "python": `print("Hello World!")`,
        "c": `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
        "c++": `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
        "java": `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
        "javascript": `console.log("Hello, World!");`
    };

    const Versions = {
        "python": "3.10.0",
        "c": "10.2.0",
        "c++": "10.2.0",
        "java": "15.0.2",
        "javascript": "1.32.3"
    };

    useEffect(() => {
        setCodeContent(Code[Language]);
    }, [Language]);

    const handleChange = (event) => {
        setLanguage(event.target.value);
    };

    // Timer logic
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

    const handleRunCode = async () => {
        try {
            const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
                "language": Language,
                "version": Versions[Language],
                "files": [
                    {
                        "content": codeContent
                    }
                ],
                "stdin": Custominput,
                "args": ["1", "2", "3"],
                "compile_timeout": 3000,
                "run_timeout": 3000,
                "compile_memory_limit": -1,
                "run_memory_limit": -1,
            });
    
            // Extract stdout and stderr
            const stdout = res.data.run.stdout.replace(/\n/g, '<br />');
            const stderr = res.data.run.stderr.replace(/\n/g, '<br />');
            const signal = res.data.run.signal;
    
            // Display the outputs, combining them if both are present
            let outputHTML = '';
            if (stderr) {
                outputHTML += `<span style="color: red;">${stderr}</span><br />`;
            }
            if(signal && !stdout){
                outputHTML += `<span style="color: red;">Runtime Erro {got infinite loop or loop limit exceed}</span><br />`;
            }
            if(signal){
                outputHTML += `<span style="color: red;">Output Limit Exceed</span><br />`;
            }
            if (stdout) {
                outputHTML += `<span>${stdout}</span>`;
            }
    
            // Set the output in the console
            document.getElementsByClassName(`${Styles.consoleresult}`)[0].innerHTML = outputHTML;
        } catch (error) {
            console.error("Error running code:", error);
            document.getElementsByClassName(`${Styles.consoleresult}`)[0].innerHTML = "<span style='color: red;'>Error executing code.</span>";
        }
    };

    const handleResetCode = () => {
        setTimer(0);               // Reset timer
        setIsRunning(true);        // Restart timer
        setCodeContent(Code[Language]); // Reset code content to predefined code
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
        setCustominput(e.target.value)
    }


    return (
        <div className={Styles.main}>
            <div className={Styles.left}>
                <div className={Styles.head}>
                    <div>
                        <Select
                            style={{ height: '38px' }}
                            value={Language}
                            onChange={handleChange}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                        >
                            <MenuItem value="">
                                <em>Language</em>
                            </MenuItem>
                            <MenuItem value={'python'}>Python 3.10.0</MenuItem>
                            <MenuItem value={'c'}>C 10.2.0</MenuItem>
                            <MenuItem value={'c++'}>C++ 10.2.0</MenuItem>
                            <MenuItem value={'java'}>Java 15.0.2</MenuItem>
                            <MenuItem value={'javascript'}>JavaScript 1.32.3</MenuItem>
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
                        <Button className={Styles.runbtn1} variant="outlined" endIcon={<PlayArrowIcon />} onClick={handleRunCode}>Run Code</Button>
                        <Button className={Styles.runbtn2} variant="outlined" onClick={handleRunCode}><PlayArrowIcon /></Button>
                    </div>
                </div>
                <div style={{border:'1px solid black'}}>
                    <Editor
                        height='90svh'
                        width="100%"
                        theme={ScreenMode ? "vs-light" : "vs-dark"}
                        language={Language==='c++' ? "cpp" : Language}
                        value={codeContent}
                        onChange={(newValue) => setCodeContent(newValue)}
                    />
                </div>
            </div>
            <div className={Styles.right}>
                <div className={Styles.input}>
                    <div className={Styles.inputhead}>
                        <h2>Custom Input :</h2>
                    </div>
                    <div className={Styles.inputbody}>
                        <textarea onChange={(e)=>{Userinput(e)}} className={Styles.inputinput}/>
                    </div>
                </div>
                <div className={Styles.console}>
                    <div className={Styles.consolehead}>
                        <h2>Output :</h2>
                    </div>
                    <div className={Styles.consolebody}>
                        <p className={Styles.consoleresult}></p>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default Piston;
