import { all } from "redux-saga/effects";
import { watchLoadRoomsData, watchLoadUserData } from "./saga";

export function* rootWatcher() {
  yield all([watchLoadUserData(), watchLoadRoomsData()]);
}
