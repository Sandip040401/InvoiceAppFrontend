import React from "react";
import './Home.css'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

function Home(){
    const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    // Handler for the "Buy Now" button
    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            await loginWithRedirect({
                appState: {
                    returnTo: "/pricing"
                }
            });
        } else {
            navigate("/pricing");
        }
    };

    return(
        <>
            <div>
                <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <a className="navbar-brand brand" href="/"><span className='brandname'>Dear </span><span className='brand-name'>Invoice</span></a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex">
                        <li className="nav-item">
                        <Link to="/" className="nav-link active" aria-current="page"><span className="hover">Home</span></Link>
                        </li>
                        <li className="nav-item">
                        <Link to="/features" className="nav-link active" aria-current="page"><span className="hover">Features</span></Link>
                        </li>
                        <li className="nav-item">
                        <Link to="/documentation" className="nav-link active" aria-current="page"><span className="hover">Documentation</span></Link>
                        </li>
                        <li className="nav-item">
                        <Link to="/pricing" className="nav-link active" aria-current="page"><span className="hover">Pricing</span></Link>
                        </li>
                        <li className="nav-item">
                        <Link to="/contact" className="nav-link active" aria-current="page"><span className="hover">Contact Us</span></Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav ml-auto mb-2 mb-lg-0 d-flex">
                        <li className="nav-item">
                        {isAuthenticated ? (
                            <>
                            <h4 style={{marginRight:'20px'}}>Welcome {user.name}</h4>
                            </>
                        ):(
                            <button style={{marginTop:'8px'}} className="nav-link active login btn" onClick={(e) => loginWithRedirect()}>Login</button>
                        )}
                        </li>
                        <li className="nav-item">
                            {isAuthenticated ? (
                            <>
                            <button className='btn btn-danger' onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                                Log Out
                            </button>
                            <button className="btn btn-success" onClick={handleBuyNow}>
                                Buy Now
                            </button>
                            </>
                            ) : (
                            <button className="btn btn-success" onClick={handleBuyNow} style={{marginTop:'8px'}}>
                                Buy Now
                            </button>
                            )}
                        </li>
                    </ul>
                    </div>
                </div>
                </nav>
            </div>
        </>
    );
}

export default Home;
