import { put, call, takeLatest } from "redux-saga/effects";

import { db } from "../../../DataBase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { fetchUsersFailure, fetchUsersSuccess } from "./userReducer";
import { FETCH_USER } from "./actions";

function* loadUserData() {
  try {
    const users = [];
    const fetchUsersRef = yield call(getDocs, collection(db, "Accounts"));

    fetchUsersRef.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id });
    });

    yield put(fetchUsersSuccess(users));
  } catch (error) {
    yield put(fetchUsersFailure(error));
  }
}

export function* watchLoadUserData() {
  yield takeLatest(FETCH_USER, loadUserData);
}
