// components/HelpContent.jsx
import React, { useState } from "react";
import "./HelpContent.css";

const HelpContent = () => {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const options = [
    "Bug Report (Report technical issues like errors, crashes, or unexpected behavior in the system.)",
    "Restaurant Report (Report problems related to restaurant services, food quality, location, etc.)",
    "Other (Any other concerns or feedback not covered above. Please describe in detail.)"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setIssueType("");
    setDescription("");
    setSubmitted(false);
  };

  return (
    <div className="help-wrapper">
      {!submitted ? (
        <form className="help-form" onSubmit={handleSubmit}>
          <h2>Report an Issue</h2>
          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
            <option value="" disabled>Choose an Issue</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
            ))}
          </select>

          <strong><label>Describe the issue in detail</label></strong>
          <textarea
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="button-group">
            <button type="button" onClick={handleReset} className="cancel">Cancel</button>
            <button type="submit" className="submit">Submit</button>
          </div>
        </form>
      ) : (
        <div className="thank-you">
          <strong><p>We appreciate your report. Our team will look into it as soon as possible.</p></strong>
          <a href="/" className="home-button">Home</a>
        </div>
      )}
    </div>
  );
};

export default HelpContent;
