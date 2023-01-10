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
import { GoogleOAuthProvider } from "@react-oauth/google";
import SetName from "./app/components/accounts/SetName";
import ReportsPage from "./app/pages/ReportsPage";
import AccountPage from "./app/pages/AccountPage";
import PasswordChangePage from "./app/pages/PasswordChangePage";
import ForgotPasswordPage from "./app/pages/ForgotPasswordPage";
import VerifyPage from "./app/pages/VerifyPage";

configure({
  axios: client,
});

const DirectoryLayout = () => {
  return (
    <UserProvider>
      <SearchProvider>
        <DirectoryProvider>
          <Outlet />
        </DirectoryProvider>
      </SearchProvider>
    </UserProvider>
  );
};

const router = createBrowserRouter([
  {
    element: <DirectoryLayout />,
    children: [
      {
        path: "/",
        element: <LoginForm />,
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
        path: "/search/:username",
        element: <SearchListing />,
      },
      {
        path: "/user/:username/*",
        element: <UserPage />,
      },
      {
        path: "/set_name",
        element: <SetName />,
      },
      {
        path: "/reports",
        element: <ReportsPage />,
      },
      { path: "/account", element: <AccountPage /> },
      { path: "/account/forgot_password", element: <ForgotPasswordPage /> },
      { path: "/account/change_password", element: <PasswordChangePage /> },
      {
        path: "/account/reset_password/:token",
        element: <PasswordChangePage />,
      },
      {
        path: "/account/verify_email/:token",
        element: <VerifyPage />,
      },
      { path: "/*", element: <LoginForm /> },
    ],
  },
]);

function App() {
  return (
    <GoogleOAuthProvider clientId="668871573548-9attupn5r13c0vu0agmt077it8oirrrh.apps.googleusercontent.com">
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;
