import axios from "axios";

export default axios.create({
	baseURL: `http://localhost/`,
	withCredentials: true,
	xsrfHeaderName: "X-CSRFToken",
	xsrfCookieName: "csrftoken",
});
