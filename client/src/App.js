import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupForm from './Components/signupform';
import LoginForm from './Components/login';
import Navbar from './Components/Navbar';
import Home from './Components/home';
import UserProfile from './Components/UserProfile';
import AdminPage from './Components/Admin';
import Description from './Components/Description';
import MoviesPage from './Components/Movies';
import Search from './Components/search';
import Footer from './Components/Footer'; // Import the Footer component
import './App.css';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Home />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/description/:movieId"
          element={<Description movies={[]} />}
        />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
