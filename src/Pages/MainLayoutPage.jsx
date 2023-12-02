import React from "react";
import { useSelector } from "react-redux";
import Chat from "../Components/Chat";
import Header from "../Components/Header";
import Loading from "../Components/Loading";

// Pictures

import join from "../Icons/join.jpg";
import create from "../Icons/еу.png";

const MainLayoutPage = () => {
  // get  Main Data of users and find

  const users = useSelector((state) => state.data.users);
  const getUserId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const userData = users.find((user) => user.id === getUserId);

  console.log(users, "userData =", userData);

  return users.length <= 0 ? (
    <Loading />
  ) : (
    <div className="main-layout">
      <header>
        <Header userData={userData} getId={getUserId} />
      </header>
      <div className="container-layout">
        <div className="card-container">
          <div className="card create-meet-card">
            <div className="create-meet-header">
              <p className="meet-header-text">Create a quiz</p>
              <div className="create-second-text-part">
                <p className="meet-header-text">Create a quiz</p>
              </div>
            </div>
            <img className="create-meet-img" src={create} alt="create"></img>
          </div>
          <div className="card join-meet-card">
            <div className="join-meet-header">
              <h3 className="join">Join</h3>
              <h3 className="to">to</h3>
              <h3 className="meet">Quiz</h3>
              <div className="join-second-text-part">
                <h3 className="join">Join</h3>
                <h3 className="to">to</h3>
                <h3 className="meet">Quiz</h3>
              </div>
            </div>
            <img className="join-meet-img" src={join} alt="join"></img>
          </div>

          <div id="cardsModal" className="modal">
            <div className="modal-content">
              <span className="close">&times;</span>
              <h2 className="header-modal">Create a Meet</h2>
            </div>
          </div>
        </div>
      </div>
      <Chat userData={userData} usersData={users} id={getUserId} />
    </div>
  );
};

export default MainLayoutPage;
