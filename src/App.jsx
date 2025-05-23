import React from 'react';
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
import MainHome from './Components/MainPage/MainHome';
import Features from './Components/MainPage/Features';
import Documentation from './Components/MainPage/Documentation';
import ContactUs from './Components/MainPage/ContactUs';
import EditBill from './Components/Pages/EditBill/EditBill';
import ManageBillDateWise from './Components/Pages/ManageBill/ManageBillDateWise';
import ViewYearlyBill from './Components/Pages/ViewBill/ViewYearlyBill';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Please wait...</p>
      </div>
    );
  }

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
            <Route path="/" element={<AddBill />} />
            <Route path="/help" element={<Help />} />
            <Route path="/view-party" element={<ViewParty />} />
            <Route path="/view-bill" element={<ViewBill />} />
            <Route path="/view-yearly-bill" element={<ViewYearlyBill />} />
            <Route path="/add-party" element={<AddParty />} />
            <Route path="/add-weekly-bill" element={<AddBill />} />
            <Route path="/manage-party" element={<ManageParty />} />
            <Route path="/manage-bill" element={<ManageBill />} />
            <Route path="/edit-weekly-bill" element={<EditBill />} />
            {/* <Route path="/delete-bill" element={<ManageBillDateWise />} /> */}
          </Routes>
          <Footer />
        </>
      )}
    </Router>
  );
}

export default App;
