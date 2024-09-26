import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
} from "@mui/material";
import styles from "../css/addproblem.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import api from "../backendapi";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const AddProblems = () => {
  const navigate = useNavigate();
  const [userName, setUsername] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("compiler_user"));
    if (!user) {
      navigate("/login");
    } else {
      setUsername(user.username);
    }
  }, []);

  const [sampleInputs, setSampleInputs] = useState([
    { input: "", output: "" },
    { input: "", output: "" },
  ]);
  const [hiddenTestCases, setHiddenTestCases] = useState([
    { input: "", output: "" },
    { input: "", output: "" },
    { input: "", output: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [problemTitle, setProblemTitle] = useState("");

  const validateInputs = () => {
    const newErrors = {};
    // Validate problem title
    if (!problemTitle) {
      newErrors.problemTitle = "Problem title is required";
    }
    // Validate problem statement
    const contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      newErrors.problemStatement = "Problem statement is required";
    }
    // Validate sample inputs
    sampleInputs.forEach((sample, index) => {
      if (!sample.input || !sample.output) {
        newErrors[`sampleInput${index}`] = "All fields are required";
      }
    });
    // Validate hidden test cases
    hiddenTestCases.forEach((testCase, index) => {
      if (!testCase.input || !testCase.output) {
        newErrors[`hiddenTestCase${index}`] = "All fields are required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateInputs()) {
      // Prepare the data as a JSON object
      const contentState = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      const data = {
        problemTitle,
        problemStatement: rawContent,
        sampleInputs,
        hiddenTestCases,
      };
      try {
        const res = await axios.post(`${api}/addproblem`, data);
        if (res.data === true) {
          alert("Submitted successfully");
          navigate("/home");
        } else {
          alert(res.data);
        }
      } catch (error) {
        console.error("Error submitting the problem", error);
        alert("An error occurred while submitting the problem.");
      }
    }
  };

  const handleSampleInputChange = (index, field, value) => {
    const updatedSampleInputs = [...sampleInputs];
    updatedSampleInputs[index][field] = value;
    setSampleInputs(updatedSampleInputs);
  };

  const handleHiddenTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...hiddenTestCases];
    updatedTestCases[index][field] = value;
    setHiddenTestCases(updatedTestCases);
  };

  const handleEditorStateChange = (state) => {
    setEditorState(state);
  };

  const handleProblemTitleChange = (value) => {
    setProblemTitle(value);
  };

  return (
    <Grid container className={styles.container}>
      <Button
        className={styles.backbtn}
        variant="outlined"
        startIcon={<ArrowBackIosIcon />}
        onClick={() => navigate("/home")}
      >
        Back To Home
      </Button>
      <Grid item xs={12} className={styles.editorSection}>
        <Typography variant="h6">Adding New Problem</Typography>
        <br/>
        {/* Problem Title */}
        <TextField
          label="Problem Title"
          variant="outlined"
          fullWidth
          className={styles.textField}
          value={problemTitle}
          onChange={(e) => handleProblemTitleChange(e.target.value)}
          error={!!errors.problemTitle}
          helperText={errors.problemTitle}
        />

        {/* Problem Statement */}
        <Box sx={{ width: '80%', border: '1px solid black', borderRadius: '4px', marginTop: '20px' }}>
          <Editor
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={handleEditorStateChange}
            editorStyle={{ borderTop: "1px solid black", minHeight: "200px", padding: "10px" }}
          />
          {errors.problemStatement && (
            <Typography color="error" variant="body2">
              {errors.problemStatement}
            </Typography>
          )}
        </Box>

        {/* Sample Inputs Section */}
        <Box className={styles.sampleInputsSection}>
          <Typography variant="h6">Sample Inputs</Typography>
          {sampleInputs.map((sample, index) => (
            <Box key={index} className={styles.sampleInput}>
              <TextField
                label={`Input ${index + 1}`}
                variant="outlined"
                fullWidth
                multiline
                minRows={1}
                className={styles.textField}
                value={sample.input}
                onChange={(e) =>
                  handleSampleInputChange(index, "input", e.target.value)
                }
                error={!!errors[`sampleInput${index}`]}
                helperText={errors[`sampleInput${index}`]}
              />
              <TextField
                label={`Output ${index + 1}`}
                variant="outlined"
                fullWidth
                multiline
                minRows={1}
                className={styles.textField}
                value={sample.output}
                onChange={(e) =>
                  handleSampleInputChange(index, "output", e.target.value)
                }
                error={!!errors[`sampleInput${index}`]}
                helperText={errors[`sampleInput${index}`]}
              />
            </Box>
          ))}
        </Box>

        {/* Hidden Test Cases Section */}
        <Box className={styles.hiddenTestCasesSection}>
          <Typography variant="h6">Hidden Test Cases</Typography>
          {hiddenTestCases.map((testCase, index) => (
            <Box key={index} className={styles.hiddenTestCase}>
              <TextField
                label={`Hidden Test Case ${index + 1} - Input`}
                variant="outlined"
                fullWidth
                multiline
                minRows={1}
                className={styles.textField}
                value={testCase.input}
                onChange={(e) =>
                  handleHiddenTestCaseChange(index, "input", e.target.value)
                }
                error={!!errors[`hiddenTestCase${index}`]}
                helperText={errors[`hiddenTestCase${index}`]}
              />
              <TextField
                label={`Hidden Test Case ${index + 1} - Output`}
                variant="outlined"
                fullWidth
                multiline
                minRows={1}
                className={styles.textField}
                value={testCase.output}
                onChange={(e) =>
                  handleHiddenTestCaseChange(index, "output", e.target.value)
                }
                error={!!errors[`hiddenTestCase${index}`]}
                helperText={errors[`hiddenTestCase${index}`]}
              />
            </Box>
          ))}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={styles.submitButton}
        >
          Submit Problem
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddProblems;
