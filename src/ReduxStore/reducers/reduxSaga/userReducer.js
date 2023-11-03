import {
  FETCH_USER,
  LOAD_USER_DATA_SUCCESS,
  LOAD_USER_DATA_FAILURE,
} from "./actions";

const initialState = {
  users: [],
  loadingUserData: false,
  userDataError: null,
};


// actions-creators

export const fetchUsers = () => ({
  type: FETCH_USER,
});

export const fetchUsersSuccess = (users) => ({
  type: LOAD_USER_DATA_SUCCESS,
  payload: users,
});

export const fetchUsersFailure = (error) => ({
  type: LOAD_USER_DATA_FAILURE,
  payload: error,
});

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER:
      return { ...state, loadingUserData: true };

    case LOAD_USER_DATA_SUCCESS:
      return {
        ...state,
        users: action.payload,
        loadingUserData: false,
      };

    case LOAD_USER_DATA_FAILURE:
      return {
        ...state,
        loadingUserData: false,
        userDataError: action.payload,
      };

    default:
      return state;
  }
};


export default userReducer;
