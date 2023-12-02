import { put, call, takeLatest } from "redux-saga/effects";
import { db } from "../../../DataBase/firebase";
import { get, ref } from "firebase/database";
import { fetchUsersFailure, fetchUsersSuccess } from "./userReducer";
import { FETCH_USER } from "./actions";

function* loadUserData() {
  try {
    const users = [];
    const fetchUsersRef = ref(db, "users/");

    const snapshot = yield call(get, fetchUsersRef);

    snapshot.forEach((doc) => {
      users.push({ ...doc.val(), id: doc.key });
    });

    console.log(users);

    yield put(fetchUsersSuccess(users));
  } catch (error) {
    yield put(fetchUsersFailure(error));
  }
}

export function* watchLoadUserData() {
  yield takeLatest(FETCH_USER, loadUserData);
}
