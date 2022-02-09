import './App.css';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Login from './Login';
import Home from './Home';
import ForgotPwd from './ForgotPwd';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/forgotpwd" element={<ForgotPwd />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
