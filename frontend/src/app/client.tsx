import axios from "axios";

export default axios.create({
  baseURL: `http://192.168.0.236/api/`,
  withCredentials: true,
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
});
