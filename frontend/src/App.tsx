import { configure } from "axios-hooks";
import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import client from "./app/client";
import LoginForm from "./app/components/accounts/LoginForm";
import RegistrationForm from "./app/components/accounts/RegistrationForm";
import SearchListing from "./app/components/directory_listing/SearchListing";
import { DirectoryProvider } from "./app/context/DirectoryContext";
import { SearchProvider } from "./app/context/SearchContext";
import { UserProvider } from "./app/context/UserContext";
import UserPage from "./app/pages/UserPage";

configure({
  axios: client,
});

const DirectoryLayout = () => {
  return (
    <SearchProvider>
      <DirectoryProvider>
        <Outlet />
      </DirectoryProvider>
    </SearchProvider>
  );
};

const router = createBrowserRouter([
  {
    element: <DirectoryLayout />,
    children: [
      {
        path: "/login",
        element: <LoginForm />,
      },
      {
        path: "/register",
        element: <RegistrationForm />,
      },
      {
        path: "/search/:username",
        element: <SearchListing />,
      },
      {
        path: "/user/:username/*",
        element: <UserPage />,
      },
    ],
  },
]);

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
