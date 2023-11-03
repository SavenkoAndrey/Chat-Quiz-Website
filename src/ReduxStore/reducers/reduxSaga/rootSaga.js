import { all } from "redux-saga/effects";
import { watchLoadUserData } from "./saga";

export function* rootWatcher() {
  yield all([watchLoadUserData()]);
}
