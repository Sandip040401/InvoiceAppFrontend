import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

function AddParty() {
  const { user, isAuthenticated } = useAuth0();
  const [partyName, setPartyName] = useState("");
  const [partyCode, setPartyCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const backendUrl = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;

    if (partyCode === "" || partyName === "") {
      setMessage("Please enter all details to submit");
      setIsError(true);
      return;
    }

    if (!alphanumericRegex.test(partyName) || !alphanumericRegex.test(partyCode)) {
      setMessage("Party Name and Party Code should only contain alphanumeric characters");
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/party`, {
        userEmail: isAuthenticated ? user.email : "", // Send email instead of userId
        partyName,
        code: partyCode
      });
      setMessage(response.data.message);
      setIsError(false);
      setPartyName("");
      setPartyCode("");
    } catch (error) {
      console.error("Error adding party:", error);
      setMessage(error.response ? error.response.data.message : "Server error");
      setIsError(true);
    }
  };

  const handlePartyNameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      setPartyName(value);
    }
  };

  const handlePartyCodeChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value)) {
      setPartyCode(value);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ marginTop: "100px" }}>
      <div className="col-md-6">
        <form
          className="card p-5 shadow-sm needs-validation"
          onSubmit={handleSubmit}
          noValidate
        >
          <h3 className="text-center mb-4">Add New Party</h3>
          <div className="mb-3">
            <label htmlFor="party-name" className="form-label fw-semibold">
              Party Name:
            </label>
            <input
              type="text"
              name="party-name"
              className="form-control"
              placeholder="Enter the Name"
              value={partyName}
              onChange={handlePartyNameChange}
              required
            />
            <div className="invalid-feedback">
              Please enter the party name.
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="party-code" className="form-label fw-semibold">
              Party Code:
            </label>
            <input
              type="text"
              name="party-code"
              className="form-control"
              placeholder="Enter the Code"
              value={partyCode}
              onChange={handlePartyCodeChange}
              required
            />
            <div className="invalid-feedback">
              Please enter the party code.
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Submit
          </button>
        </form>
        {message && (
          <div
            className={`alert mt-4 ${isError ? "alert-danger" : "alert-success"}`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddParty;
