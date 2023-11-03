import {
  applyMiddleware,
  combineReducers,
  legacy_createStore as createStore,
} from "redux";

import logger from 'redux-logger'
import createSagaMiddleware from "redux-saga";
import roomReducer from "./reduxSaga/roomReducer";
import { rootWatcher } from "./reduxSaga/rootSaga";
import userReducer from "./reduxSaga/userReducer";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware]

const rootReducer = combineReducers({
  data: userReducer,
  roomsData: roomReducer,
});

// for control the redux with a logger if my mode = development

if(process.env.NODE_ENV === 'development'){
  middleware.push(logger)
}

const store = createStore(rootReducer, applyMiddleware(...middleware));

sagaMiddleware.run(rootWatcher);

export default store;
