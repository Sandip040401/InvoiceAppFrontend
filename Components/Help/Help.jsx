import React from "react";
import './Help.css';

function Help() {
  return (
    <>
    <div className="container my-5">
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">
         Help & Instructions
        </div>
        <div className="card-body">
          <p className="lead">Welcome to our website! Here's how you can make the most out of our features:</p>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <h5 className="mb-1">Add Party</h5>
              <p className="mb-1">You can add a new party by navigating to the 'Add Party' section and filling in the required details.</p>
            </li>
            <li className="list-group-item">
              <h5 className="mb-1">Add Weekly Bills</h5>
              <p className="mb-1">Go to the 'Add Weekly Bills' section to enter your weekly expenses.</p>
            </li>
            <li className="list-group-item">
              <h5 className="mb-1">Navigate Weekly Bills Table</h5>
              <p className="mb-1">Use the WASD keys to navigate through the weekly bills table for easy access and editing.</p>
            </li>
            <li className="list-group-item">
              <h5 className="mb-1">View Bills Party-wise</h5>
              <p className="mb-1">You can view bills associated with each party in the 'Party-wise Bills' section.</p>
            </li>
            <li className="list-group-item">
              <h5 className="mb-1">View Weekly Bills</h5>
              <p className="mb-1">Check out the 'Weekly Bills' section to see all your expenses for the week.</p>
            </li>
            <li className="list-group-item">
              <h5 className="mb-1">Delete Party</h5>
              <p className="mb-1">Remove a party from your records by using the 'Delete Party' option.</p>
            </li>
            <li className="list-group-item">
              <h5 className="mb-1">Delete Bill Week-wise</h5>
              <p className="mb-1">You can delete bills for a specific week using the 'Delete Weekly Bill' function.</p>
            </li>
            <li className="list-group-item">
              <h5 className="mb-1">Download Weekly Bill</h5>
              <p className="mb-1">Download a report of your weekly bills from the 'Download Weekly Bill' section.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div style={{height:'30px'}}>
    </div>
    </>
  );
}

export default Help;
