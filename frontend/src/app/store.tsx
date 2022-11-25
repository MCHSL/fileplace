import { applyMiddleware, configureStore } from "@reduxjs/toolkit";
import directoryListReducer from "./components/reducers/directoryList";
import { composeWithDevTools } from "redux-devtools-extension";

import thunkMiddleware from "redux-thunk";

const enhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

export default configureStore({
  reducer: {
    directoryList: directoryListReducer,
  },
});
