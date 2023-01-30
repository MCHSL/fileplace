import React, { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import client from "../client";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>();
  const [loading, setLoading] = useState<boolean>();
  const [success, setSuccess] = useState<boolean>();

  const onSubmit = (values: any) => {
    console.log("hewwo?");
    setError(null);
    setLoading(true);
    client
      .post("/user/register", values)
      .then(() => setSuccess(true))
      .catch((res) => {
        setError(res.response.data);
      })
      .finally(() => setLoading(false));
  };

  const onValidate = async (values: any) => {
    let errors = {};
    if (!values.username) {
      errors["username"] = "Required";
    } else {
      if (values.username.length > 20) {
        errors["username"] = "Username must be at most 20 characters";
      }
      if (!values.username.match(/^[a-zA-Z0-9]+$/)) {
        errors["username"] = "Username must be alphanumeric";
      }
      await client
        .get("/user/check_username/" + values.username)
        .then((res) => {
          if (res.data.exists) {
            errors["username"] = "Username is taken";
          }
        });
    }
    if (!values.password) {
      errors["password"] = { message: "Required", validation: {} };
    } else {
      let passwordErrors = {};
      passwordErrors["length"] = values.password.length < 10;
      passwordErrors["uppercase"] = !values.password.match(/[A-Z]/);
      passwordErrors["lowercase"] = !values.password.match(/[a-z]/);
      passwordErrors["number"] = !values.password.match(/[0-9]/);
      passwordErrors["special"] = !values.password.match(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
      );

      if (Object.values(passwordErrors).some((x) => x)) {
        errors["password"] = {
          message: "Invalid password",
          validation: passwordErrors,
        };
      }
    }
    if (!values.email) {
      errors["email"] = "Required";
    } else {
      if (!values.email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)) {
        errors["email"] = "Invalid email address";
      }
    }

    console.log(errors);
    return errors;
  };

  return (
    <div className="flex justify-center w-full">
      <Form
        onSubmit={onSubmit}
        validate={onValidate}
        render={({ handleSubmit }) => (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <h2 className="font-bold mb-2 text-lg">Register</h2>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3"></span>
              </div>
            )}
            {success ? (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <span className="block sm:inline">
                  Success! Please check your email to verify your account.
                </span>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <Field name="username">
                    {({ input, meta }) => (
                      <div className="flex flex-col">
                        <input
                          {...input}
                          type="text"
                          placeholder="Username"
                          className={`shadow transition-colors duration-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            meta.error && meta.touched
                              ? "border-red-500 shadow-red-500"
                              : ""
                          }`}
                        />
                        {meta.error && meta.touched && (
                          <span className="text-left px-1 text-red-500">
                            {meta.error}
                          </span>
                        )}
                      </div>
                    )}
                  </Field>
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <Field name="email">
                    {({ input, meta }) => (
                      <div className="flex flex-col">
                        <input
                          {...input}
                          type="text"
                          placeholder="Email"
                          className={`shadow transition-colors duration-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            meta.error && meta.touched
                              ? "border-red-500 shadow-red-500"
                              : ""
                          }`}
                        />
                        {meta.error && meta.touched && (
                          <span className="text-left px-1 text-red-500">
                            {meta.error}
                          </span>
                        )}
                      </div>
                    )}
                  </Field>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <Field name="password">
                    {({ input, meta }) => (
                      <div className="flex flex-col">
                        <input
                          {...input}
                          type="password"
                          placeholder="Password"
                          className={`shadow transition-colors duration-300 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                            meta.error?.message && meta.touched
                              ? "border-red-500 shadow-red-500"
                              : ""
                          }`}
                        />
                        {meta.error?.message !== null && meta.touched && (
                          <span className="text-left px-1 text-red-500">
                            {meta.error?.message}
                          </span>
                        )}
                        <div>
                          <span>Password must:</span>
                          <ul className="list-none text-left text-sm subpixel-antialiased">
                            <li
                              data-error={meta.error?.validation["length"]}
                              className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                            >
                              Be at least 10 characters long
                            </li>
                            <li
                              data-error={meta.error?.validation["uppercase"]}
                              className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                            >
                              Contain at least one uppercase letter
                            </li>
                            <li
                              data-error={meta.error?.validation["lowercase"]}
                              className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                            >
                              Contain at least one lowercase letter
                            </li>
                            <li
                              data-error={meta.error?.validation["number"]}
                              className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                            >
                              Contain at least one number
                            </li>
                            <li
                              data-error={meta.error?.validation["special"]}
                              className="data-[error=true]:text-red-500 data-[error=false]:text-green-500"
                            >
                              Contain at least one special character
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </Field>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="shadow border rounded py-2 px-4 min-w-max"
                >
                  {loading ? <ScaleLoader color="#000000" loading /> : "Submit"}
                </button>
              </>
            )}
            <div className="text-red-500">{error}</div>
          </form>
        )}
      />
    </div>
  );
};

export default RegistrationPage;
