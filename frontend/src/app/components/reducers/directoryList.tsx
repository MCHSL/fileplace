import { createSlice } from "@reduxjs/toolkit";
import client from "../../client";

export const directoryListSlice = createSlice({
  name: "directoryList",
  initialState: {
    name: "",
    children: [],
    files: [],
  },
  reducers: {
    set: (state, action) => {
      state.name = action.payload.name;
      state.children = action.payload.children;
    },
  },
});

// Action creators are generated for each case reducer function
export const { set } = directoryListSlice.actions;

export default directoryListSlice.reducer;

export async function fetchTodos(dispatch, getState) {
  const response = await client.get("/directory/2/");
  dispatch({ type: "directoryList/set", payload: response.data });
}
