import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import Styles from "../css/editor.module.css";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LightModeIcon from '@mui/icons-material/LightMode';
import CachedIcon from '@mui/icons-material/Cached';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Button, Select, MenuItem } from "@mui/material";
import axios from "axios";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate, useParams } from "react-router-dom";
import api from "../backendapi";
import { Editor as _Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw,convertFromRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Codeeditor = () => {
    const navigate = useNavigate()
    const [userName, setUsername] = useState('')
    const [problemData, setproblemData] = useState({})
    const {qno,id} = useParams();
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("compiler_user"));
      if (!user) {
        navigate("/login");
      } else {
        setUsername(user.username);
        axios.get(`${api}/question/${id}`).then((res) => {
          const rawContent = res.data.problemStatement;
          const contentState = convertFromRaw(JSON.parse(rawContent));
          const editorState = EditorState.createWithContent(contentState);
          setEditorState(editorState);
          setproblemData(res.data);
        });
      }
    }, []);
    
  const [Language, setLanguage] = useState('python');
  const [ScreenMode, setScreenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [codeContent, setCodeContent] = useState('');
  const [Custominput, setCustominput] = useState('');
  const [loading, setLoading] = useState(false);
  const handleCodeChange = (newValue) => {
    if (!isRunning) {
      setIsRunning(true);
    }
    setCodeContent(newValue);
  };


  const Code = {
    "python": `print("Hello World!")`,
    "c": `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    "cpp": `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
    "java": `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    "javascript": `console.log("Hello, World!");`,
    "java":`public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    "dart":`void main() {\n    print('Hello, World!');\n}`,
    "verilog": `module HelloWorld;\ninitial begin\n  $display("Hello, World!");\nend\nendmodule` // Verilog template

};

  useEffect(() => {
    setCodeContent(Code[Language]);
  }, [Language]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
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
    const outputDiv = document.querySelector('#result');
    if (!outputDiv) {
        console.error("Output element not found");
        return;
    }

    // Set loading state to true
    setLoading(true);

    // Clear previous output
    outputDiv.innerHTML = '';

    // Determine if custom input is used
    const isCustomInput = Custominput.trim() !== '';
    const inputToUse = isCustomInput ? Custominput : null;

    if (isCustomInput) {
        try {
            const response = await axios.post(`${api}/${Language}`, {
                code: codeContent,
                input: inputToUse, // Use custom input
                userName:userName
            });

            // Extract and sanitize the output
            const { output = '', error = '' } = response.data;
            const sanitizedOutput = output.trim().replace(/\r\n/g, '\n');
            
            // Display result
            outputDiv.innerHTML += `<div style="color: ${error ? 'red' : 'black'}; display: flex; flex-direction: column; margin-bottom: 10px;">
                                      <span><strong>Input:</strong> ${escapeHtml(inputToUse.replace(/\n/g, '<br />'))}</span>
                                      <span><strong>Output:</strong> ${escapeHtml(sanitizedOutput.replace(/\n/g, '<br />'))}</span>
                                      ${error ? `<span style="color: red;"><strong>Error:</strong> ${escapeHtml(error)}</span>` : ''} 
                                    </div>`;
        } catch (error) {
            outputDiv.innerHTML += `<div style="color: red; display: flex; flex-direction: column; margin-bottom: 10px;">
                                      <span><strong>Error:</strong> ${escapeHtml(error.message)}</span>
                                    </div>`;
        }
    } else {
        try {
            const response = await axios.post(`${api}/problemcompiler/${Language}`, {
                code: codeContent,
                id: id,
                userName:userName
            });
            
            // Assuming response.data contains testResults
            const testResults = response.data.testResults;
            
            // Separate sample and hidden test cases
            const sampleTestCases = testResults.filter(result => !result.isHidden);
            const hiddenTestCases = testResults.filter(result => result.isHidden);
            
            // Create table rows for sample test cases
            let tableRows = '';
            sampleTestCases.forEach((result, index) => {
                const { input, expectedOutput, output, result: testResult, error } = result;
                const rowColor = testResult === 'passed' ? 'green' : 'red';
                
                tableRows += `
                    <tr style="color: ${rowColor};">
                      <td>${input || ''}</td>
                      <td>${expectedOutput || ''}</td>
                      <td>${output || ''}</td>
                      <td>${error || ''}</td>
                    </tr>
                `;
            });
            
            // Display table
            outputDiv.innerHTML += `
                <table style="width: 100%; border-collapse: collapse !important;  border: 1px solid black;">
                  <thead>
                    <tr>
                      <th>Input</th>
                      <th>Expected Output</th>
                      <th>Output</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
            `;
            
            // Summarize hidden test cases
            if (hiddenTestCases.length > 0) {
                const allHiddenPassed = hiddenTestCases.every(result => result.result === 'passed');
                const hiddenSummary = allHiddenPassed 
                    ? 'All hidden test cases are passed.' 
                    : 'Some hidden test cases failed.';
                const summaryColor = allHiddenPassed ? 'green' : 'red';
                
                outputDiv.innerHTML += `<div style="color: ${summaryColor}; margin-top: 10px;">
                                          <strong>${hiddenSummary}</strong>
                                        </div>`;
            }
        } catch (error) {
            outputDiv.innerHTML += `<div style="color: red; display: flex; flex-direction: column; margin-bottom: 10px;">
                                      <span><strong>Error:</strong> ${escapeHtml(error.message)}</span>
                                    </div>`;
        }
    }

    // Clear custom input after execution
    setCustominput('');

    // Set loading state to false
    setLoading(false);
};

  const handleResetCode = () => {
    setTimer(0);
    setIsRunning(false);
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

  const handleChange = (event) => {
    setLanguage(event.target.value);
  };

  const Userinput = (e) => {
    setCustominput(e.target.value);
  };
  const formatMultilineText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className={Styles.main}>
      <div className={Styles.right}>
        <div className={Styles.rparent}>
            <Button
                className={Styles.backbtn}
                variant="outlined"
                startIcon= {<ArrowBackIosIcon />}
                disabled={loading}
                onClick={()=>{navigate('/home')}}
                >
                Back To Home
            </Button>
            <h1>Problem {qno} :</h1>
            <_Editor
              editorState={editorState}
              toolbarHidden={true} // This will hide the toolbar
              readOnly={true} // This makes the editor non-editable
              editorStyle={{ minHeight: "200px", padding: "10px" }}
            />
        </div>
      </div>
      <div className={Styles.left}>
        <div className={Styles.leftup}>
          <div className={Styles.head}>
            <div className={Styles.headright}>
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
              <h5 className={Styles.time} style={{ color: isFullscreen && !ScreenMode ? 'white' : 'inherit' }}>
                {formatTime(timer)}
              </h5>
            </div>
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
                <MenuItem value={'cpp'}>Cpp 10.2.0</MenuItem>
                <MenuItem value={'java'}>Java 21.0.1 (LTS)</MenuItem>
                <MenuItem value={'dart'}>Dart 3.0.0</MenuItem>
                <MenuItem value={'javascript'}>JavaScript 1.32.3</MenuItem>
                <MenuItem value={'verilog'}>Verilog</MenuItem>
              </Select>
            </div>
          </div>
          <div style={{border:'1px solid black'}}>
            <Editor
              height='90svh'
              width="100%"
              theme={ScreenMode ? "vs-light" : "vs-dark"}
              language={Language}
              value={codeContent}
              onChange={(newValue) => handleCodeChange(newValue)}
            />
          </div>
        </div>
        <div className={Styles.leftdown}>
          <div className={Styles.input}>
            <div className={Styles.inputhead}>
              <h2>Custom Input :</h2>
            </div>
            <div className={Styles.inputbody}>
              <textarea value={Custominput} onChange={Userinput} className={Styles.inputinput}/>
            </div>
          </div>
          <div className={Styles.console}>
            <div className={Styles.consolehead}>
              <h2>Output :</h2>
            </div>
            <div className={Styles.consolebody}>
              <div id="result" className={Styles.consoleresult}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Codeeditor;
