import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchRoom } from "../ReduxStore/reducers/reduxSaga/roomReducer";
import { fetchUsers } from "../ReduxStore/reducers/reduxSaga/userReducer";

const Loading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoom());
    setIsLoading(false);
  }, [dispatch]);

  return (
    isLoading && (
      <div className="body-loading-container">
        <div className="loader-container">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
    )
  );
};

export default Loading;
