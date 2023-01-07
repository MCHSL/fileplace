import axios from "axios";

export default axios.create({
  baseURL: `${location.protocol}//${location.hostname}/api/`,
  withCredentials: true,
  xsrfHeaderName: "X-CSRFToken",
  xsrfCookieName: "csrftoken",
});
