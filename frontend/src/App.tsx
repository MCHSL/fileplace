import { configure } from "axios-hooks";
import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import client from "./app/client";
import LoginPage from "./app/pages/LoginPage";
import RegistrationPage from "./app/pages/RegistrationPage";
import SearchPage from "./app/pages/SearchPage";
import { DirectoryProvider } from "./app/context/DirectoryContext";
import { SearchProvider } from "./app/context/SearchContext";
import { UserProvider } from "./app/context/UserContext";
import UserPage from "./app/pages/UserPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SetNamePage from "./app/pages/SetNamePage";
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
        element: <LoginPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegistrationPage />,
      },
      {
        path: "/search/:username",
        element: <SearchPage />,
      },
      {
        path: "/user/:username/*",
        element: <UserPage />,
      },
      {
        path: "/set_name",
        element: <SetNamePage />,
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
      { path: "/*", element: <LoginPage /> },
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
