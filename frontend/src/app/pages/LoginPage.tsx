import React, { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { useLocation, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import client from "../client";
import useUser from "../context/UserContext";
import { useGoogleLogin } from "@react-oauth/google";
// @ts-ignore
import imgUrl from "./google-login.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userLoading, refetchUser } = useUser();
  const [error, setError] = useState<string | null>();
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    if (user && !userLoading) {
      console.log(user.username);
      if (user.username === null) {
        console.log("set name!");
        navigate("/set_name");
      } else {
        console.log("navigate");
        navigate(location.state?.next || "/user/" + user.username);
      }
    }
    console.log("asdksda");
  }, [user, userLoading]);

  const onSubmit = (values: any) => {
    setError(null);
    setLoading(true);
    client
      .post("/user/login", values)
      .then(refetchUser)
      .catch((e) => {
        if (!e.response) {
          setError("Something went wrong. Please try again later.");
        } else {
          setError(e.response.data);
        }
      })
      .finally(() => setLoading(false));
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

  const googleLogin = useGoogleLogin({
    redirect_uri: "postmessage",
    onSuccess: (codeResponse) => {
      setLoading(true);
      client
        .post("/user/oauth/google", codeResponse)
        .then(refetchUser)
        .catch((e) => {
          setError("Something went wrong. Please try again later.");
        })
        .finally(() => setLoading(false));
    },
    flow: "auth-code",
  });

  return (
    <div className="flex justify-center flex-col max-w-md items-center m-auto">
      <Form
        onSubmit={onSubmit}
        validate={onValidate}
        render={({ handleSubmit }) => (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <h2 className="font-bold mb-2 text-lg">Login</h2>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3"></span>
              </div>
            )}
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
                      type="password"
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

            <div className="flex flex-col gap-1">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="shadow border rounded py-2 px-4 mx-auto"
              >
                {loading ? <ScaleLoader color="#000000" loading /> : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/account/forgot_password")}
                className="text-blue-500 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}
      />
      <div className="flex flex-col gap-1">
        <button
          onClick={() => googleLogin()}
          className="border border-slate-400 rounded py-1/2 px-4"
        >
          <img src={imgUrl} alt="Log in with Google" />
        </button>
        <button
          onClick={() => navigate("/register")}
          className="border border-slate-400 rounded py-2 px-4"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
