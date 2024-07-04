import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import './Navbar.css';
import { useAuth0 } from "@auth0/auth0-react";

function Navbar() {
    const { user, logout } = useAuth0();
    const backendUrl = import.meta.env.VITE_BASE_URL;
    useEffect(() => {
        handleSubmit();
    });
    const handleSubmit = async (e) => {
      try {
          const response = await fetch(`${backendUrl}/api/user`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({user}) // Include totalNP in the submission
          });
  
          if (!response.ok) {
              throw new Error('user already exist');
          }
      } catch (error) {
          console.log(error);
      }
  };
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/" style={{ textDecoration: "none" }}>
                    <h2 className="mb-0 fw-bold me-2"><span style={{ color: "#007BFF" }}>Welcome</span></h2>
                    <h4 className="mb-0 text-muted">{ user.name }</h4>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item" style={{fontWeight:'600'}}>
                            {/* <Link className="nav-link" to="/">Dashboard</Link> */}
                        </li>
                        <li className="nav-item dropdown">
                            <button 
                                className="nav-link dropdown-toggle btn btn-light" 
                                id="navbarDropdown" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                View
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><Link className="dropdown-item" to="/view-party">View Party Wise</Link></li>
                                <li><Link className="dropdown-item" to="/view-bill">View Weekly Bill</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <button 
                                className="nav-link dropdown-toggle btn btn-light" 
                                id="navbarDropdown" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                Add 
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><Link className="dropdown-item" to="/add-party">Add Party</Link></li>
                                <li><Link className="dropdown-item" to="/add-weekly-bill">Add Weekly Bill</Link></li>
                                <li><Link className="dropdown-item" to="/edit-weekly-bill">Edit Weekly Bill</Link></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <button 
                                className="nav-link dropdown-toggle btn btn-light" 
                                id="navbarDropdown" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                Manage
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><Link className="dropdown-item" to="/manage-party">Delete Party</Link></li>
                                <li><Link className="dropdown-item" to="/manage-bill">Delete Bill</Link></li>
                                {/* <li><Link className="dropdown-item" to="/delete-bill">Delete Billssss</Link></li> */}
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/help">Help</Link>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        <div className="nav-item dropdown">
                            <button 
                                className="btn btn-light nav-link dropdown-toggle d-flex align-items-center p-0" 
                                id="profileDropdown" 
                                role="button" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                            >
                                <img src={user.picture} alt={user.name} className="rounded-circle me-2" style={{ width: "40px", height: "40px" }} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                <li className="dropdown-item-text">{user.name}</li>
                                <li>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                    >
                                        Log Out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
