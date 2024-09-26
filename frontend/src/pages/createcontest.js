import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, TextField } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../backendapi';

const CreateContestPage = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [contestName, setContestName] = useState('');
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${api}/allqns`)
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
      });
  }, []);

  const handleChange = (event) => {
    setSelectedQuestions(event.target.value);
  };

  const handleContestNameChange = (event) => {
    setContestName(event.target.value);
  };

  const handleCreateContest = () => {
    if (!contestName) {
      alert('Please enter a contest name.');
      return;
    }

    axios.post(`${api}/newcontest`, { name: contestName, questions: selectedQuestions })
      .then(response => {
        console.log('Contest created:', response.data);
        alert('Contest Created')
        navigate("/contests")
      })
      .catch(error => {
        console.error('Error creating contest:', error);
        alert("Unexpected Error")
      });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Create a New Contest
      </Typography>
      <TextField
        label="Contest Name"
        fullWidth
        value={contestName}
        onChange={handleContestNameChange}
        sx={{ mt: 2 }}
      />
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Questions</InputLabel>
        <Select
          multiple
          value={selectedQuestions}
          onChange={handleChange}
          renderValue={(selected) => selected.join(', ')}
        >
          {questions.map((question) => (
            <MenuItem key={question._id} value={question._id}>
              <Checkbox checked={selectedQuestions.indexOf(question._id) > -1} />
              <ListItemText primary={question.problemStatement} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={handleCreateContest}
        sx={{ mt: 4 }}
      >
        Create Contest
      </Button>
    </Container>
  );
};

export default CreateContestPage;
