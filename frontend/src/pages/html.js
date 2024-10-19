import React, { useEffect, useState } from 'react';
import { Editor } from "@monaco-editor/react";
import Styles from "../css/html.module.css";
import { Button } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';

const HtmlCompiler = () => {
  const navigate = useNavigate();

  const [htmlContent, setHtmlContent] = useState("<div>\n    <!--Write Your Html Code Here-->        \n</dvi>");
  const [cssContent, setCssContent] = useState('body { font-family: Arial; }');
  const [jsContent, setJsContent] = useState('console.log("Hello World");');
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [ScreenMode, setScreenMode] = useState(true); // Light mode by default
  const [logs, setLogs] = useState([]); // State to store logs

  // Function to capture and store logs
  const captureLogs = (log) => {
    setLogs((prevLogs) => [...prevLogs, log]);
  };

  // Function to generate the content for iframe with log capturing
  const generateIframeContent = () => {
    const srcDoc = `
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>
            (function() {
              const log = console.log;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
                log.apply(console, args);
              };
            })();
            ${jsContent}
          </script>
        </body>
      </html>
    `;
    setIframeSrcDoc(srcDoc);
  };

  // Run code and update iframe content
  const handleRunCode = () => {
    setLogs([]); // Clear logs before running code
    generateIframeContent();
  };

  useEffect(() => {
    // Listen for log messages from the iframe
    const handleLogMessage = (event) => {
      if (event.data.type === 'log') {
        captureLogs(event.data.message);
      }
    };

    window.addEventListener('message', handleLogMessage);

    return () => {
      window.removeEventListener('message', handleLogMessage);
    };
  }, []);

  return (
    <div className={Styles.main}>
      <div className={Styles.head}>
        <div className={Styles.headright}>
          <Button
            variant="outlined"
            onClick={handleRunCode}
            disabled={isRunning}
            className={Styles.runbtn1}
          >
            Run Code
          </Button>
          <Button
            className={Styles.backbtn}
            variant="outlined"
            startIcon={<ArrowBackIosIcon />}
            onClick={() => navigate('/home')}
          >
            Back TO Home
          </Button>
        </div>
      </div>
      <div className={Styles.left}>

        {/* HTML Editor */}
        <div className={Styles.html}>
          <h4>HTML</h4>
          <Editor
            height="30svh"
            language="html"
            value={htmlContent}
            onChange={(newValue) => setHtmlContent(newValue)}
            theme={ScreenMode ? "vs-light" : "vs-dark"}
          />
        </div>

        {/* CSS Editor */}
        <div className={Styles.css}>
          <h4>CSS</h4>
          <Editor
            height="30svh"
            language="css"
            value={cssContent}
            onChange={(newValue) => setCssContent(newValue)}
            theme={ScreenMode ? "vs-light" : "vs-dark"}
          />
        </div>

        {/* JavaScript Editor */}
        <div className={Styles.js}>
          <h4>JavaScript</h4>
          <Editor
            height="30svh"
            language="javascript"
            value={jsContent}
            onChange={(newValue) => setJsContent(newValue)}
            theme={ScreenMode ? "vs-light" : "vs-dark"}
          />
        </div>
        {/* Logs */}
        <div className={Styles.logs}>
          <h4>Logs</h4>
          <div className={Styles.logOutput}>
            {logs.length > 0 ? logs.map((log, index) => (
              <div key={index}>{log}</div>
            )) : <div>No logs yet.</div>}
          </div>
        </div>
      </div>

      {/* Right Panel: Output */}
      <div className={Styles.right}>

        {/* Output Iframe */}
        <div className={Styles.output}>
          <h2>Output :</h2>
          <iframe
            srcDoc={iframeSrcDoc}
            title="output"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
};

export default HtmlCompiler;
