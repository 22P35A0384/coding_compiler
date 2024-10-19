import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, CardActions, Grid, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../backendapi';

const BackgroundCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  backgroundImage: `url('https://cdn2.f-cdn.com/files/download/117657449/b9525e.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: '#fff',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  borderRadius: '8px',
  boxShadow: theme.shadows[5],
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
  '& .MuiCardActions-root': {
    position: 'relative',
    zIndex: 1,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 0,
  },
}));

const SingleContestPage = () => {
    const navigate = useNavigate()
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await axios.get(`${api}/contest/${id}`);
        setContest(response.data);

        const questionDetails = await Promise.all(
          response.data.questions.map(async (questionId) => {
            const questionResponse = await axios.get(`${api}/question/${questionId}`);
            return questionResponse.data;
          })
        );
        setQuestions(questionDetails);
      } catch (error) {
        console.error('Error fetching contest or questions:', error);
      }
    };

    fetchContest();
  }, [id]);

  if (!contest) return <Typography variant="h6">Loading...</Typography>;

  const handleSolve = (problem,n) => {
    console.log(problem,n)
    localStorage.setItem("currentproblem", JSON.stringify(problem))
    localStorage.setItem("qn", n+1)
    navigate("/editor");
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Contest Details
      </Typography>
      <BackgroundCard sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {contest.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {contest.description || 'No description available'}
          </Typography>
        </CardContent>
      </BackgroundCard>
      <Typography variant="h6" gutterBottom>
        Questions:
      </Typography>
      <Grid container spacing={4}>
        {questions.map((question,i) => (
          <Grid item xs={12} sm={6} md={4} key={question._id}>
            <BackgroundCard>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {question.problemStatement}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  onClick={()=>{handleSolve(question,i)}}
                  variant="contained" 
                  color="primary"
                >
                  Solve
                </Button>
              </CardActions>
            </BackgroundCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SingleContestPage;
