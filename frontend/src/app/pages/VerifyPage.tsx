import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../client";

const VerifyPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    client
      .post("/user/verify_email", {
        token: token,
      })
      .then(() => {
        navigate("/account");
      })
      .catch((err) => {
        setError(err.response.data);
        console.log(err);
      });
  }, [token]);

  return <div>{error || "Verifying..."}</div>;
};

export default VerifyPage;
