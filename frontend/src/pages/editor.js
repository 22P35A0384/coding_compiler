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

  // Add Verilog to the supported languages
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

  // Add Verilog template in the Code object
  const Code = {
    "python": `print("Hello World!")`,
    "c": `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    "cpp": `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
    "java": `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    "javascript": `console.log("Hello, World!");`,
    "dart":`void main() {\n    print('Hello, World!');\n}`,
    // Add Verilog template
    "verilog": `module hello;\n initial begin\n  $display("Hello, World!");\n  $finish;\n end\nendmodule`
  };

  // Set default template for selected language
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

  // Update handleRunCode to handle Verilog
  const handleRunCode = async () => {
    const outputDiv = document.querySelector('#result');
    if (!outputDiv) {
        console.error("Output element not found");
        return;
    }

    setLoading(true);
    outputDiv.innerHTML = '';

    const isCustomInput = Custominput.trim() !== '';
    const inputToUse = isCustomInput ? Custominput : null;

    if (isCustomInput) {
        try {
            const response = await axios.post(`${api}/${Language}`, {
                code: codeContent,
                input: inputToUse,
            });

            const { output = '', error = '' } = response.data;
            const sanitizedOutput = output.trim().replace(/\r\n/g, '\n');
            outputDiv.innerHTML += `<div style="color: ${error ? 'red' : 'black'};">
                                      <strong>Input:</strong> ${escapeHtml(inputToUse.replace(/\n/g, '<br />'))}<br />
                                      <strong>Output:</strong> ${escapeHtml(sanitizedOutput.replace(/\n/g, '<br />'))}
                                      ${error ? `<strong>Error:</strong> ${escapeHtml(error)}` : ''}
                                    </div>`;
        } catch (error) {
            outputDiv.innerHTML += `<div style="color: red;">
                                      <strong>Error:</strong> ${escapeHtml(error.message)}
                                    </div>`;
        }
    } else {
        try {
            const response = await axios.post(`${api}/problemcompiler/${Language}`, {
                code: codeContent,
                id: id,
                userName: userName
            });

            const testResults = response.data.testResults;
            let tableRows = '';
            testResults.forEach((result) => {
                const { input, expectedOutput, output, result: testResult, error } = result;
                const rowColor = testResult === 'passed' ? 'green' : 'red';
                tableRows += `<tr style="color: ${rowColor};">
                                <td>${input || ''}</td>
                                <td>${expectedOutput || ''}</td>
                                <td>${output || ''}</td>
                                <td>${error || ''}</td>
                              </tr>`;
            });

            outputDiv.innerHTML += `
                <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
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
        } catch (error) {
            outputDiv.innerHTML += `<div style="color: red;">
                                      <strong>Error:</strong> ${escapeHtml(error.message)}
                                    </div>`;
        }
    }

    setCustominput('');
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

  return (
    <div className={Styles.main}>
      <div className={Styles.right}>
        <div className={Styles.rparent}>
            <Button
                className={Styles.backbtn}
                variant="outlined"
                startIcon={<ArrowBackIosIcon />}
                disabled={loading}
                onClick={() => navigate('/home')}
            >
                Back To Home
            </Button>
            <h1 className={Styles.header}>{problemData.title}</h1>
        </div>
        <div className={Styles.probcontainer}>
          <_Editor 
            editorState={editorState} 
            toolbarHidden 
            readOnly 
            wrapperClassName="demo-wrapper" 
            editorClassName="demo-editor" 
          />
        </div>
      </div>
      <div className={Styles.left}>
        <div className={Styles.lparent}>
          <div className={Styles.language}>
            <Select value={Language} onChange={handleChange} className={Styles.select}>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="c">C</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="dart">Dart</MenuItem>
              <MenuItem value="verilog">Verilog</MenuItem> {/* Verilog added here */}
            </Select>
          </div>
          <div className={Styles.middleicons}>
            <CachedIcon style={{cursor: 'pointer'}} onClick={handleResetCode} />
            {isFullscreen ? 
              <FullscreenExitIcon 
                style={{cursor: 'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit'}} 
                onClick={toggleFullscreen} 
              />
              :
              <FullscreenIcon 
                style={{cursor: 'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit'}} 
                onClick={toggleFullscreen} 
              />
            }
            {ScreenMode ?
              <DarkModeIcon style={{cursor: 'pointer'}} onClick={() => setScreenMode(!ScreenMode)} /> 
              :
              <LightModeIcon style={{cursor: 'pointer'}} onClick={() => setScreenMode(!ScreenMode)} />
            }
          </div>
        </div>
        <div className={Styles.editcontainer}>
          <Editor
            height="90vh"
            language={Language}
            value={codeContent}
            theme={ScreenMode ? 'vs-dark' : 'vs-light'}
            onChange={handleCodeChange}
          />
        </div>
        <div className={Styles.timer}>{formatTime(timer)}</div>
        <div className={Styles.inputdiv}>
          <textarea 
            placeholder="Enter your custom input here (Optional)"
            value={Custominput}
            onChange={Userinput}
          />
        </div>
        <div className={Styles.runcode}>
          <Button
            variant="contained"
            startIcon={loading ? null : <PlayArrowIcon />}
            disabled={loading}
            onClick={handleRunCode}
            className={Styles.runbtn}
          >
            {loading ? <div className={Styles.spinner}></div> : "Run Code"}
          </Button>
        </div>
        <div className={Styles.outputdiv}>
          <p style={{fontWeight: 'bold', fontSize: '25px'}}>Output</p>
          <div id="result"></div>
        </div>
      </div>
    </div>
  );
};

export default Codeeditor;
