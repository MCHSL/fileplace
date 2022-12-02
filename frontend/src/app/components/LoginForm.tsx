import { Form, Field } from "react-final-form";
import React, { useEffect, useState } from "react";
import client from "../client";
import { useNavigate } from "react-router-dom";
import useUser from "../context/UserContext";
import { ScaleLoader } from "react-spinners";

const LoginForm = () => {
  const navigate = useNavigate();
  const { user, refetchUser } = useUser();
  const [error, setError] = useState<string | null>();
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    if (user) {
      navigate("/");
      return;
    }
  }, [user]);

  const onSubmit = (values: any) => {
    setError(null);
    setLoading(true);
    client
      .post("/user/login", values)
      .then(() => {
        refetchUser()
          .then(() => navigate("/"))
          .then(() => setLoading(false));
      })
      .catch(() => {
        setLoading(false);
        setError("Invalid username or password.");
      });
  };

  const onValidate = (values: any) => {
    let errors = {};
    if (!values.username) {
      errors["username"] = "Required";
    }
    if (!values.password) {
      errors["password"] = "Required";
    }
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
            <h2 className="font-bold mb-2 text-lg">Login</h2>
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
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <Field name="password">
                {({ input, meta }) => (
                  <div className="flex flex-col">
                    <input
                      {...input}
                      type="text"
                      placeholder="Password"
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

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="shadow border rounded py-2 px-4 min-w-max"
            >
              {loading ? <ScaleLoader color="#000000" loading /> : "Submit"}
            </button>
            <div className="text-red-500">{error}</div>
          </form>
        )}
      />
    </div>
  );
};

export default LoginForm;
