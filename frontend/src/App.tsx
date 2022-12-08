import { configure } from "axios-hooks";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import client from "./app/client";
import LoginForm from "./app/components/LoginForm";
import SearchListing from "./app/components/SearchListing";
import { DirectoryProvider } from "./app/context/DirectoryContext";
import { SearchProvider } from "./app/context/SearchContext";
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
  {
    path: "/search",
    element: <SearchListing />,
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
