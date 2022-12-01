import { Form, Field } from "react-final-form";
import React, { useState } from "react";
import client from "../client";
import { useNavigate } from "react-router-dom";
import useUser from "../context/UserContext";
import { ScaleLoader } from "react-spinners"

const LoginForm = () =>
{
	const navigate = useNavigate();
	const { refetchUser } = useUser();
	const [error, setError] = useState<string | null>();
	const [loading, setLoading] = useState<boolean>();

	const onSubmit = (values: any) =>
	{
		setError(null);
		setLoading(true);
		console.log(values);
		client.post("/login", values).then((res) =>
		{
			setLoading(false);
			refetchUser().then(() => navigate("/"));
		}).catch((e) =>
		{
			setLoading(false);
			setError("Invalid username or password.");
		});
	};

	const onValidate = (values: any) =>
	{
		let errors = {};
		if (!values.username)
		{
			errors["username"] = "Required";
		}
		if (!values.password)
		{
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



						<button type="submit" onClick={handleSubmit} disabled={loading} className="shadow border rounded py-2 px-4 min-w-max">
							{loading ? <ScaleLoader color="#000000" loading /> : "Submit"}
						</button>
						<div className="text-red-500">
							{error}
						</div>
					</form>
				)}
			/>
		</div>
	);
};

export default LoginForm;
