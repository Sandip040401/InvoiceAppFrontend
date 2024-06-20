import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ViewParty from './Components/Pages/ViewParty/ViewParty';
import AddParty from './Components/Pages/AddParty/AddParty';
import AddBill from './Components/Pages/AddBill/AddBill';
import Navbar from './Components/Navbar/Navbar';
import ViewBill from './Components/Pages/ViewBill/ViewBill';
import './App.css';
import Footer from './Components/Footer/Footer';
import ManageParty from './Components/Pages/ManageParty/ManageParty';
import ManageBill from './Components/Pages/ManageBill/ManageBill';
import Home from './Components/Home/Home';
import Dashboard from './Components/Dashboard/Dashboard';
import Help from './Components/Help/Help';
import Pricing from './Components/Pricing/Pricing';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import MainHome from './Components/MainPage/MainHome';
import Features from './Components/MainPage/Features';
import Documentation from './Components/MainPage/Documentation';
import ContactUs from './Components/MainPage/ContactUs';
import EditBill from './Components/Pages/EditBill/EditBill';

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Router>
      {!isAuthenticated ? (
        <>
          <Home />
          <Routes>
            <Route path="/" element={<MainHome />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
          <Footer />
        </>
      ) : (
        <>
          {isAuthenticated && <Navbar />}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/help" element={<Help />} />
            <Route path="/view-party" element={<ViewParty />} />
            <Route path="/view-bill" element={<ViewBill />} />
            <Route path="/add-party" element={<AddParty />} />
            <Route path="/add-weekly-bill" element={<AddBill />} />
            <Route path="/manage-party" element={<ManageParty />} />
            <Route path="/manage-bill" element={<ManageBill />} />
            <Route path="/edit-weekly-bill" element={<EditBill />} />
          </Routes>
          <Footer />
        </>
      )}
    </Router>
  );
}

export default App;
