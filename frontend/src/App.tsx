import { useState } from "react";
import "./App.css";
import React from "react";
import { useSelector } from "react-redux";
import LoginForm from "./app/components/LoginForm";

function App() {
  const directory = useSelector((state: any) => state.directoryList);

  console.log(directory);

  return (
    <div className="flex justify-center">
      <LoginForm />
    </div>
  );
}

export default App;
