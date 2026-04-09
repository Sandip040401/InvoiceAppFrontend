import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./AddBill.css";


function AddBill() {
  const { user, isAuthenticated } = useAuth0();
  const [formData, setFormData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [partyNames, setPartyNames] = useState([]);
  const [codes, setCodes] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [columnTotals, setColumnTotals] = useState({
    payment: 0,
    PWT: 0,
    CASH: 0,
    BANK: 0,
    DUE: 0,
    N_P: 0,
    D_Return: 0,   // ✅ new field for D_Return
    S_TDS: 0,   // ✅ replaced TCS
    P_ATD: 0,   // ✅ replaced TDS
    C_ATD: 0,   // ✅ replaced ATD
    Total: 0,
  });
  const [totalNP, setTotalNP] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const backendUrl = import.meta.env.VITE_BASE_URL;


  useEffect(() => {
    fetchPartyNames();
  }, [user]);


  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  useEffect(() => {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);


  useEffect(() => {
    updateColumnTotals(formData);
  }, [totalNP]);


  const fetchPartyNames = async () => {
    try {
      if (isAuthenticated && user) {
        const response = await fetch(`${backendUrl}/api/party/${user.email}`);
        if (!response.ok) {
          throw new Error("Error fetching party names");
        }
        const partyNamesData = await response.json();
        if (!partyNamesData.codes || !partyNamesData.partyNames) {
          throw new Error("Invalid party names data format");
        }
        const { codes, partyNames } = partyNamesData;
        if (!Array.isArray(codes) || !Array.isArray(partyNames)) {
          throw new Error("Codes or party names data is not an array");
        }
        if (codes.length === 0 || partyNames.length === 0) {
          throw new Error("No codes or party names data received");
        }


        const sortedPartyNames = partyNames;
        const sortedCodes = codes;


        setPartyNames(sortedPartyNames);
        setCodes(sortedCodes);


        const initialFormData = sortedPartyNames.map((party, index) => ({
          code: sortedCodes[index],
          partyName: party,
          payment: "",
          PWT: "",
          CASH: "",
          BANK: "",
          DUE: "",
          N_P: "",
          D_Return:"",
          S_TDS: "",   // ✅ replaced TCS
          P_ATD: "",   // ✅ replaced TDS
          C_ATD: "",   // ✅ replaced ATD
        }));
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error("Error fetching party names: ", error);
    }
  };


  const handleChange = (index, name, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index][name] = value || "0";
    setFormData(updatedFormData);
    updateColumnTotals(updatedFormData);
  };


  const getTotal = (data) => {
    const numbers = Object.entries(data)
      .filter(([key]) => !["payment", "code", "partyName"].includes(key))
      .map(([key, value]) => parseFloat(value || 0));
    return numbers.reduce((acc, curr) => acc + curr, 0).toFixed(2);
  };


  const updateColumnTotals = (data) => {
    const totals = data.reduce(
      (acc, curr) => {
        acc.payment += parseFloat(curr.payment || 0);
        acc.PWT     += parseFloat(curr.PWT     || 0);
        acc.CASH    += parseFloat(curr.CASH    || 0);
        acc.BANK    += parseFloat(curr.BANK    || 0);
        acc.DUE     += parseFloat(curr.DUE     || 0);
        acc.N_P     += parseFloat(curr.N_P     || 0);
        acc.D_Return += parseFloat(curr.D_Return || 0);   // ✅
        acc.S_TDS   += parseFloat(curr.S_TDS   || 0);   // ✅
        acc.P_ATD   += parseFloat(curr.P_ATD   || 0);   // ✅
        acc.C_ATD   += parseFloat(curr.C_ATD   || 0);   // ✅
        acc.Total   += parseFloat(getTotal(curr));
        return acc;
      },
      {
        payment: 0, PWT: 0, CASH: 0, BANK: 0, DUE: 0,
        N_P: 0, D_Return: 0, S_TDS: 0, P_ATD: 0, C_ATD: 0, Total: 0,
      }
    );

    totals.payment += parseFloat(totalNP || 0);
    setColumnTotals(totals);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setMessage("Both start date and end date are required.");
      setIsError(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const bills = formData.map((data) => ({
        code:      data.code,
        startDate,
        endDate,
        partyName: data.partyName,
        payment:   data.payment,
        PWT:       data.PWT,
        CASH:      data.CASH,
        BANK:      data.BANK,
        DUE:       data.DUE,
        N_P:       data.N_P,
        npEntries: [            // ✅ new structure
          {
            D_Return: data.D_Return,
            S_TDS: data.S_TDS,
            P_ATD: data.P_ATD,
            C_ATD: data.C_ATD,
          },
        ],
      }));
      const email = user.email;
      const response = await fetch(`${backendUrl}/api/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bills, totalNP, email }),  // ✅ same as old
      });

      if (!response.ok) {
        throw new Error("bills already exist");
      }
      setMessage("Bills added successfully");
      setIsError(false);
    } catch (error) {
      setMessage("Error adding bills: " + error.message);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleKeyDown = (e) => {
    const inputs = document.getElementsByTagName("input");
    const currentIndex = Array.from(inputs).findIndex(
      (input) => document.activeElement === input
    );
    let nextIndex;

    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      nextIndex = currentIndex === 0 ? inputs.length - 1 : currentIndex - 1;
    } else if (e.key === "d" || e.key === "D") {
      e.preventDefault();
      nextIndex = currentIndex === inputs.length - 1 ? 0 : currentIndex + 1;
    } else if (e.key === "w" || e.key === "W") {
      e.preventDefault();
      nextIndex = currentIndex < 9 ? 0 : currentIndex - 9;  // ✅ 10→9
    } else if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      nextIndex =
        currentIndex + 9 >= inputs.length   // ✅ 10→9
          ? currentIndex % 9               // ✅ 10→9
          : currentIndex + 9;              // ✅ 10→9
    }

    inputs[nextIndex].focus();
  };


  return (
    <>
      <div className="container mt-5">
        <div className="card shadow">
          <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
            Add Weekly Bill
            <i
              className="fas fa-info-circle"
              style={{ color: "white", backgroundColor: "#0D6EFD" }}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Use W, A, S, D to move between the cells"
            ></i>
          </div>
          {message && (
            <div
              className={`mt-3 alert ${
                isError ? "alert-danger" : "alert-success"
              }`}
              role="alert"
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 1000,
                maxWidth: "80%",
                textAlign: "center",
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card-body">
            <div className="d-flex justify-content-around">
              <div className="form-group mx-4" style={{ width: "400px" }}>
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group mx-4" style={{ width: "400px" }}>
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
            </div>
            <table className="table table-bordered mt-4">
              <thead className="thead-dark">
                <tr>
                  <th>Code</th>
                  <th>Party Name</th>
                  <th>Payment</th>
                  <th>PWT</th>
                  <th>CASH</th>
                  <th>BANK</th>
                  <th>DUE</th>
                  <th>N/P</th>
                  <th>D_Return</th>   {/* ✅ new column */}
                  <th>STDS</th>    {/* ✅ replaced TCS */}
                  <th>P-ATD</th>   {/* ✅ replaced TDS */}
                  <th>C-ATD</th>   {/* ✅ replaced ATD */}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.code}</td>
                    <td>{data.partyName}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={data.payment}
                        onChange={(e) => handleChange(index, "payment", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={data.PWT}
                        onChange={(e) => handleChange(index, "PWT", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={data.CASH}
                        onChange={(e) => handleChange(index, "CASH", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={data.BANK}
                        onChange={(e) => handleChange(index, "BANK", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={data.DUE}
                        onChange={(e) => handleChange(index, "DUE", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={data.N_P}
                        onChange={(e) => handleChange(index, "N_P", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                     <td>   {/* ✅ D_Return added */}
                      <input
                        type="number"
                        className="form-control"
                        value={data.D_Return}
                        onChange={(e) => handleChange(index, "D_Return", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>   {/* ✅ S_TDS replaced TCS */}
                      <input
                        type="number"
                        className="form-control"
                        value={data.S_TDS}
                        onChange={(e) => handleChange(index, "S_TDS", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>   {/* ✅ P_ATD replaced TDS */}
                      <input
                        type="number"
                        className="form-control"
                        value={data.P_ATD}
                        onChange={(e) => handleChange(index, "P_ATD", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>   {/* ✅ C_ATD replaced ATD */}
                      <input
                        type="number"
                        className="form-control"
                        value={data.C_ATD}
                        onChange={(e) => handleChange(index, "C_ATD", e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </td>
                    <td>{getTotal(data)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="2"><b>Total N/P:</b></td>
                  <td colSpan="1">
                    <input
                      type="number"
                      className="form-control"
                      value={totalNP}
                      onChange={(e) => setTotalNP(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan="2"><b>Total:</b></td>
                  <td><b>{columnTotals.payment.toFixed(2)}</b></td>
                  <td><b>{columnTotals.PWT.toFixed(2)}</b></td>
                  <td><b>{columnTotals.CASH.toFixed(2)}</b></td>
                  <td><b>{columnTotals.BANK.toFixed(2)}</b></td>
                  <td><b>{columnTotals.DUE.toFixed(2)}</b></td>
                  <td><b>{columnTotals.N_P.toFixed(2)}</b></td>
                  <td><b>{columnTotals.D_Return.toFixed(2)}</b></td>   {/* ✅ */}
                  <td><b>{columnTotals.S_TDS.toFixed(2)}</b></td>   {/* ✅ */}
                  <td><b>{columnTotals.P_ATD.toFixed(2)}</b></td>   {/* ✅ */}
                  <td><b>{columnTotals.C_ATD.toFixed(2)}</b></td>   {/* ✅ */}
                  <td><b>{columnTotals.Total.toFixed(2)}</b></td>
                </tr>
              </tbody>
            </table>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={(e) => console.log("=== BUTTON CLICKED ===")}
              onMouseDown={(e) => console.log("=== MOUSE DOWN ON BUTTON ===")}
              onMouseEnter={(e) => console.log("=== MOUSE ENTERED BUTTON ===")}
              onMouseOver={(e) => console.log("=== MOUSE OVER BUTTON ===")}
              style={{
                height: "40px",
                paddingTop: "10px",
                position: "relative",
                zIndex: 9999,
                pointerEvents: "auto",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}


export default AddBill;