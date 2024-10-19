import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Codeeditor from './pages/editor';
import Compiler from './pages/compiler';
import HomePage from './pages/home';
import Login from './pages/login';
import Test from './pages/test';
import AddProblems from './pages/addproblem';
import Logout from './pages/logout';
import ContestPage from './pages/contest';
import CreateContestPage from './pages/createcontest';
import SingleContestPage from './pages/singlecontest';
import Piston from './pages/testcompiler';
import Signup from './pages/signup';
import SqlandVarilog from './pages/sql&varilog';
import Varilog from './pages/varilog';
import Jdoodle_Sql from './pages/jdoodle_sql';
import Html from './pages/html';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/editor/:qno/:id" element={<Codeeditor />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/test' element={<Test />} />
          <Route path='/addproblem' element={<AddProblems />} />
          <Route path='/logout' element={<Logout/>}/>
          <Route path='/contests' element={<ContestPage/>}/>
          <Route path='/createcontest' element={<CreateContestPage/>}/>
          <Route path='/contest/:id' element={<SingleContestPage/>}/>
          <Route path='/piston' element={<Piston/>}/>
          <Route path='/sql' element={<SqlandVarilog/>}/>
          <Route path='/verilog' element={<Varilog/>}/>
          <Route path='/jdoodle_sql' element={<Jdoodle_Sql/>}/>
          <Route path='/html' element={<Html/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
