import { put, call, takeLatest } from "redux-saga/effects";
import { db } from "../../../DataBase/firebase";
import { get, ref } from "firebase/database";
import { fetchUsersFailure, fetchUsersSuccess } from "./userReducer";
import { FETCH_ROOM, FETCH_USER } from "./actions";
import { fetchRoomFailure, fetchRoomSuccess } from "./roomReducer";

function* loadUserData() {
  try {
    const users = [];
    const fetchUsersRef = ref(db, "users/");

    const snapshot = yield call(get, fetchUsersRef);

    snapshot.forEach((doc) => {
      users.push({ ...doc.val(), id: doc.key });
    });

    yield put(fetchUsersSuccess(users));
  } catch (error) {
    yield put(fetchUsersFailure(error));
  }
}

export function* watchLoadUserData() {
  yield takeLatest(FETCH_USER, loadUserData);
}

function* loadRoomData() {
  try {
    const rooms = [];
    const fetchRoomsRef = ref(db, "rooms/");

    const snapshot = yield call(get, fetchRoomsRef);

    snapshot.forEach((doc) => {
      rooms.push({ ...doc.val(), id: doc.key });
    });

    yield put(fetchRoomSuccess(rooms));
  } catch (error) {
    yield put(fetchRoomFailure(error));
  }
}

export function* watchLoadRoomsData() {
  yield takeLatest(FETCH_ROOM, loadRoomData);
}
