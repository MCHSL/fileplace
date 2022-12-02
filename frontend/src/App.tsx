import { configure } from "axios-hooks";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import client from "./app/client";
import LoginForm from "./app/components/LoginForm";
import { DirectoryProvider } from "./app/context/DirectoryContext";
import { UserProvider } from "./app/context/UserContext";
import HomePage from "./app/pages/HomePage";

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
