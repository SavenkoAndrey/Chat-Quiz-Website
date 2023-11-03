import {
  FETCH_ROOM,
  LOAD_ROOM_DATA_SUCCESS,
  LOAD_ROOM_DATA_FAILURE,
} from "./actions";

const initialState = {
  rooms: [],
  loadingRoomData: false,
  roomDataError: null,
};

export const fetchRoom = () => ({
  type: FETCH_ROOM,
});

export const fetchRoomSuccess = (room) => ({
  type: LOAD_ROOM_DATA_SUCCESS,
  payload: room,
});

export const fetchRoomFailure = (error) => ({
  type: LOAD_ROOM_DATA_FAILURE,
  payload: error,
});

const roomReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ROOM:
      return { ...state, loadingRoomData: true, roomDataError: null };

    case LOAD_ROOM_DATA_SUCCESS:
      // const rooms = action.payload.reduce((acc, room) => {
      //   acc[room.id] = room;
      //   return acc;
      // }, []);

      return { ...state, rooms: action.payload, loadingRoomData: false };

    case LOAD_ROOM_DATA_FAILURE:
      return { ...state, loadingRoomData: false, roomDataError: action.error };
    default:
      return state;
  }
};

export default roomReducer;
