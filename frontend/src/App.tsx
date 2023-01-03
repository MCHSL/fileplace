import { configure } from "axios-hooks";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import client from "./app/client";
import LoginForm from "./app/components/accounts/LoginForm";
import RegistrationForm from "./app/components/accounts/RegistrationForm";
import SearchListing from "./app/components/directory_listing/SearchListing";
import { DirectoryProvider } from "./app/context/DirectoryContext";
import { SearchProvider } from "./app/context/SearchContext";
import { UserProvider } from "./app/context/UserContext";
import HomePage from "./app/pages/HomePage";
import UserPage from "./app/pages/UserPage";

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
  {
    path: "/register",
    element: <RegistrationForm />,
  },
  {
    path: "/search",
    element: <SearchListing />,
  },
  {
    path: "/user/:username",
    element: <UserPage />,
  },
]);

function App() {
  return (
    <UserProvider>
      <DirectoryProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </DirectoryProvider>
    </UserProvider>
  );
}

export default App;
