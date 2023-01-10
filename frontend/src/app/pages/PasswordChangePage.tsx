import React, { useState } from "react";
import { Field, Form } from "react-final-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import client from "../client";
import useUser from "../context/UserContext";

const PasswordChangePage = () => {
  const [passwordError, setPasswordError] = useState("");
  const token = useParams<{ token: string | undefined }>().token;

  const { user, userLoading, refetchUser } = useUser();
  const navigate = useNavigate();

  const changePassword = (values) => {
    setPasswordError("");
    if (token) {
      client
        .post("/user/reset_password", {
          token: token,
          new_password: values.newPassword,
        })
        .then(refetchUser)
        .then(() => {
          setPasswordError("");
          navigate("/account");
        })
        .catch((err) => {
          setPasswordError(err.response.data);
        });
    } else {
      client
        .post("/user/change_password", {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        })
        .then(refetchUser)
        .then(() => {
          setPasswordError("");
          navigate("/account");
        })
        .catch((err) => {
          setPasswordError(err.response.data);
        });
    }
  };

  if (!token && userLoading) {
    return (
      <div>
        <h1>Change Password</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!token && !user) {
    return (
      <div>
        <h1>Change Password</h1>
        <p>You are not logged in.</p>
      </div>
    );
  }

  const validate = (values: any) => {
    const errors: any = {};
    if (!token && !values.currentPassword) {
      errors.currentPassword = "Required";
    }

    if (!values.newPassword) {
      errors["newPassword"] = { message: "Required", validation: {} };
    } else {
      let passwordErrors = {};
      passwordErrors["length"] = values.newPassword.length < 10;
      passwordErrors["uppercase"] = !values.newPassword.match(/[A-Z]/);
      passwordErrors["lowercase"] = !values.newPassword.match(/[a-z]/);
      passwordErrors["number"] = !values.newPassword.match(/[0-9]/);
      passwordErrors["special"] = !values.newPassword.match(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
      );

      if (Object.values(passwordErrors).some((x) => x)) {
        errors["newPassword"] = {
          message: "Invalid password",
          validation: passwordErrors,
        };
      }
    }

    if (!values.confirmNewPassword) {
      errors["confirmNewPassword"] = "Required";
    } else if (values.confirmNewPassword !== values.newPassword) {
      errors["confirmNewPassword"] = "Passwords do not match";
    }

    return errors;
  };

  return (
    <div>
      <Form
        onSubmit={changePassword}
        validate={validate}
        render={({ handleSubmit, errors, dirtyFields }) => (
          <form
            onSubmit={handleSubmit}
            className="w-1/2 mx-auto shadow p-2 rounded"
          >
            <h1>Change Password</h1>
            {passwordError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mt-4 rounded"
                role="alert"
              >
                <span className="block sm:inline">{passwordError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1 mt-4">
              {!token && (
                <div className="flex flex-row justify-between p-2">
                  <label
                    htmlFor="currentPassword"
                    className="place-self-center"
                  >
                    Current Password:
                  </label>
                  <Field
                    name="currentPassword"
                    render={({ input, meta }) => (
                      <div className="flex flex-col place-content-end w-1/2">
                        <input
                          {...input}
                          type="password"
                          className="border rounded shadow p-2 w-full"
                        />

                        {meta.error && meta.touched && (
                          <span className="text-red-500 text-xs">
                            {meta.error}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>
              )}
              <div className="flex flex-row justify-between p-2">
                <label htmlFor="newPassword" className="place-self-center">
                  New Password:
                </label>
                <Field
                  name="newPassword"
                  render={({ input, meta }) => (
                    <div className="flex flex-col w-1/2">
                      <input
                        {...input}
                        type="password"
                        className="border rounded shadow p-2 w-full"
                      />
                      {meta.error && meta.touched && (
                        <span className="text-red-500 text-xs">
                          {meta.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col justify-end">
                <span>Password must: </span>
                <ul className="list-none text-left text-sm subpixel-antialiased mx-auto">
                  <li
                    data-error={
                      dirtyFields.newPassword &&
                      !!errors?.newPassword?.validation["length"]
                    }
                    className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                  >
                    Be at least 10 characters long
                  </li>
                  <li
                    data-error={
                      dirtyFields.newPassword &&
                      !!errors?.newPassword?.validation["uppercase"]
                    }
                    className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                  >
                    Contain at least one uppercase letter
                  </li>
                  <li
                    data-error={
                      dirtyFields.newPassword &&
                      !!errors?.newPassword?.validation["lowercase"]
                    }
                    className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                  >
                    Contain at least one lowercase letter
                  </li>
                  <li
                    data-error={
                      dirtyFields.newPassword &&
                      !!errors?.newPassword?.validation["number"]
                    }
                    className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                  >
                    Contain at least one number
                  </li>
                  <li
                    data-error={
                      dirtyFields.newPassword &&
                      !!errors?.newPassword?.validation["special"]
                    }
                    className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                  >
                    Contain at least one special character
                  </li>
                </ul>
              </div>
              <div className="flex flex-row justify-between p-2">
                <label
                  htmlFor="confirmNewPassword"
                  className="place-self-center"
                >
                  Confirm New Password:
                </label>
                <Field
                  name="confirmNewPassword"
                  render={({ input, meta }) => (
                    <div className="flex flex-col place-content-end w-1/2">
                      <input
                        {...input}
                        type="password"
                        className="border rounded shadow p-2 w-full"
                      />
                      {meta.error && meta.touched && (
                        <span className="text-red-500 text-xs">
                          {meta.error}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-row gap-4 justify-center">
                {!token && (
                  <button
                    type="button"
                    onClick={() => navigate("/account")}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default PasswordChangePage;
