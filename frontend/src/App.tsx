import "./App.css";
import React from "react";
import LoginForm from "./app/components/LoginForm";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { configure } from "axios-hooks";
import client from "./app/client";
import HomePage from "./app/pages/HomePage";
import { UserProvider } from "./app/context/UserContext";
import { DirectoryProvider } from "./app/context/DirectoryContext";

configure({
  axios: client,
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
]);

function App() {
  return (
    <UserProvider>
      <DirectoryProvider>
        <RouterProvider router={router} />
      </DirectoryProvider>
    </UserProvider>
  );
}

export default App;
