import { Form, Field } from "react-final-form";
import React from "react";

const MyForm = () => {
  const onSubmit = (values: any) => {
    console.log("Beep");
    console.log(values);
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
    <div className="w-full max-w-xs">
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
              <Field
                name="username"
                component="input"
                placeholder="username"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <Field
                name="password"
                component="input"
                placeholder="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <button type="submit" onClick={handleSubmit}>
              Submit
            </button>
          </form>
        )}
      />
    </div>
  );
};

export default MyForm;
