import React, { useState } from "react";
import "./FakeVerification.css";

const FakeVerification = ({ backendUp }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="container">
      <h2>Verify you are human</h2>
      <label className="checkbox-label">
        <input className="checkbox-input"
          type="checkbox"
          checked={checked}
          onChange={() => setChecked(true)} // can only check
          disabled={checked} // disable after checking
        />
        I'm not a robot
      </label>

      {checked && !backendUp && (
        <div className="spinner-container">
          <div className="loader"></div>
          <p>Verifying...</p>
        </div>
      )}
    </div>
  );
};

export default FakeVerification;
