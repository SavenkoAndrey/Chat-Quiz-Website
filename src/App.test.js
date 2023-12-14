import { render, screen } from "@testing-library/react";
import AuthorizationPage from "./Pages/AuthorizationPage";
import { expectSaga } from "redux-saga-test-plan";
import { watchLoadUserData } from "./ReduxStore/reducers/reduxSaga/saga";
import userReducer, {
  fetchUsers,
  fetchUsersSuccess,
} from "./ReduxStore/reducers/reduxSaga/userReducer";
import configureMockStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./ReduxStore/reducers/store";
import Header from "./Components/Header";

// test("renders AuthorizationPage component", () => {
//   render(
//     <Provider store={store}>
//       <Router>
//         <AuthorizationPage />
//       </Router>
//     </Provider>
//   );

//   console.log(document.body.innerHTML);
//   const loginButton = screen.getByText("Authorization");
//   expect(loginButton).toBeInTheDocument();
// });

// test("renders Header component", () => {
//   render(<Header />);
//   console.log(document.body.innerHTML);
//   const loginButton = screen.getByText("Chat quiz");
//   expect(loginButton).toBeInTheDocument();
// });

test("loads user data successfully", () => {
  return expectSaga(watchLoadUserData).dispatch(fetchUsers()).run();
});

const mockStore = configureMockStore();
const mockStorege = mockStore({});

test("adds users on success", () => {
  const users = [
    {
      email: "fake.mail@gmail.com",
      invitationCode: 1234567890,
      notification: { invitation: "", update: "" },
      password: "Pass123",
      userIcon: "https://fakeIcon.png",
      username: "Fake User",
    },
  ];
  const action = fetchUsersSuccess(users);
  const newState = userReducer({}, action);
  expect(newState.users).toEqual(users);
});

test("fetchUsers action creator", () => {
  const action = fetchUsers();
  expect(action.type).toEqual("FETCH_USER");
});

// test('selectUsers selector', () => {
//   const users = [{ id: 1, name: 'Test User' }];
//   const state = { data: { users } };
//   const selectedUsers = selectUsers(state);
//   expect(selectedUsers).toEqual(users);
// });
