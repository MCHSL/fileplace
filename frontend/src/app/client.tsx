import axios from "axios";

export default axios.create({
  baseURL: `http://${location.hostname}/api/`,
  withCredentials: true,
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
});
