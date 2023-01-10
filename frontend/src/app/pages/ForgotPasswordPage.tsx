import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../client";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const sendEmail = () => {
    client
      .post("/user/request_password_reset", { email })
      .then((res) => {
        setError("");
        setSuccess(true);
      })
      .catch((err) => {
        setError("An error occurred. Please try again later.");
        setSuccess(false);
      });
  };

  return (
    <div className="shadow rounded p-4 w-1/2 mx-auto flex flex-col gap-2">
      <p>Enter your email address below to receive a password reset link.</p>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
          role="alert"
        >
          <span className="block sm:inline">
            We've sent a reset link to the requested email.
          </span>
        </div>
      )}
      <div className="flex flex-row justify-center gap-8">
        <label className="place-self-center">Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded shadow p-1"
        />
      </div>
      <span className="flex flex-row gap-2 mx-auto">
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Login
        </button>
        <button
          onClick={sendEmail}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send Email
        </button>
      </span>
    </div>
  );
};

export default ForgotPasswordPage;
