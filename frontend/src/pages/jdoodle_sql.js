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
import axios from 'axios';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';
import api from '../backendapi';

const Jdoodle_Sql = () => {
    const navigate = useNavigate();
    const [userName, setUsername] = useState('');
    const [Language, setLanguage] = useState('sql');
    const [ScreenMode, setScreenMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [codeContent, setCodeContent] = useState('');
    const [Custominput, setCustominput] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseData, setResponseData] = useState(null); // To store API response data

    const Code = {
        "sql": `SELECT * FROM yourTable WHERE id = ?`
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("compiler_user"));
        if (!user) {
            navigate("/login");
        } else {
            setUsername(user.username);
        }
    }, [navigate]);

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
        setLoading(true);
        setResponseData(null); // Reset response data

        try {
            const response = await axios.post(`${api}/api/jdoodle/execute`, {
                script: codeContent,
                language: 'sql',
                versionIndex: '0',
            });

            // Call the function to handle the response
            handleResponse(response.data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = (data) => {
        const { success, message, error, data: sqlData } = data;

        let formattedResponse = {
            success: success !== undefined ? success : '-',
            error: error !== undefined ? error : '-',
            message: message !== undefined ? message : '-',
            sqlData: sqlData || [],
        };

        setResponseData(formattedResponse);
    };

    const handleError = (error) => {
        const errorResponse = error.response ? error.response.data : { error: error.message, message: 'Internal Server Error' };
        const formattedResponse = {
            success: false,
            error: errorResponse.error || '-',
            message: errorResponse.message || '-',
            sqlData: [],
        };

        setResponseData(formattedResponse);
    };

    const handleResetCode = () => {
        setTimer(0);
        setIsRunning(true);
        setCodeContent(Code[Language]);
        setResponseData(null); // Reset response data on reset
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
                            <MenuItem value={'sql'}>SQL</MenuItem>
                        </Select>
                    </div>
                    <div className={Styles.headright}>
                        <h5 className={Styles.time} style={{ color: isFullscreen && !ScreenMode ? 'white' : 'inherit' }}>
                            {formatTime(timer)}
                        </h5>
                        <div onClick={() => setScreenMode(!ScreenMode)}>
                            {ScreenMode ? <DarkModeIcon style={{ cursor: 'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit' }} /> : <LightModeIcon style={{ cursor: 'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit' }} />}
                        </div>
                        <CachedIcon style={{ cursor: 'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit' }} onClick={handleResetCode} />
                        {isFullscreen ? <FullscreenExitIcon style={{ cursor: 'pointer', color: 'white' }} onClick={toggleFullscreen} /> : <FullscreenIcon style={{ cursor: 'pointer', color: isFullscreen && !ScreenMode ? 'white' : 'inherit' }} onClick={toggleFullscreen} />}
                        <Button
                            className={Styles.runbtn1}
                            variant="outlined"
                            endIcon={loading ? null : <PlayArrowIcon />}
                            disabled={loading}
                            onClick={handleRunCode}
                        >
                            {loading ? <div className={Styles.spinner}></div> : 'Run Code'}
                        </Button>
                    </div>
                </div>
                <div style={{ border: '1px solid black' }}>
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
                    startIcon={<ArrowBackIosIcon />}
                    onClick={() => { navigate('/home') }}
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
                        <div className={Styles.consoleresult}>
                            {/* Conditional rendering based on responseData state */}
                            {responseData ? (
                                <table border="1" cellpadding="5" cellspacing="0">
                                    <thead>
                                        <tr>
                                            <th>Success</th>
                                            <th>Error</th>
                                            <th>Message</th>
                                            <th>Output</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{escapeHtml(String(responseData.success))}</td>
                                            <td style={{ color: 'red' }}>{escapeHtml(String(responseData.error))}</td>
                                            <td style={{ color: 'red' }}>{escapeHtml(String(responseData.message))}</td>
                                            <td
                                              dangerouslySetInnerHTML={{
                                                __html: (responseData.sqlData.output)
                                                  .replace(/\|/g, ' ')    // Replace all '|' with spaces
                                                  .replace(/\n/g, '<br/>') // Replace newline characters (\n) with <br/>
                                                  .replace(/(\d+\s\w+)/g, '<br/>$1')  // Add <br/> before each record
                                              }}
                                            />
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <p>No output yet. Run your code!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jdoodle_Sql;
