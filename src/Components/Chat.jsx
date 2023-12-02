import {
  ArrowDownOutlined,
  SettingOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect, useRef } from "react";
import { message } from "antd";
import FriendsModal from "../Modal/FriendsModal";
import { off, onValue, ref, set } from "firebase/database";
import { db } from "../DataBase/firebase";
import RequestModal from "../Modal/RequestModal";

const Chat = ({ userData, usersData, id }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme"));
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  // const [message, setMessage] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  // friend's state

  const [isCheckFriends, setIsCheckFriends] = useState(false);
  const [findFriend, setFindFriend] = useState("");
  const [isFoundFriend, setIsFoundFriend] = useState(null);
  const [friends, setFriends] = useState([]);

  // request's state

  const [isCheckRequests, setIsCheckRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  console.log(requests);

  const menuRef = useRef(null);

  // for Theme change

  const handleThemeChange = () => {
    setIsDarkTheme(!isDarkTheme);

    // save the selection
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

    const getTheme = localStorage.getItem("theme");
    setTheme(getTheme);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current) {
        const isOutsideMenu = !menuRef.current.contains(event.target);
        const isIconMenu = event.target.id === "settings";

        if (isOutsideMenu && !isIconMenu) {
          setIsOpenMenu(false);
          setIsCheckFriends(false);
          setIsCheckRequests(false);
        }
      }
    };

    const handleEscButton = (event) => {
      if (event.key === "Escape") {
        setIsOpenChat(false);
      }
    };

    window.addEventListener("keydown", handleEscButton);
    document.addEventListener("click", handleClickOutside);

    // find a friend with a Invitation code

    const timer = setTimeout(async () => {
      if (findFriend.length > 0) {
        const findFriendNum = +findFriend;
        const isFoundFriend = usersData.find(
          (code) => code.invitationCode === findFriendNum
        );
        setIsFoundFriend(isFoundFriend);
        console.log(isFoundFriend);
      } else {
        setIsFoundFriend(null);
      }
    }, 300);

    // get new data

    const requestRef = ref(db, `users/${id}/requests`);
    const friendsRef = ref(db, `users/${id}/friends`);

    const handleRequestsData = (snapshot) => {
      const requests = snapshot.val();
      console.log(requests);
      if (requests) {
        const keys = Object.keys(requests);
        const requestsArray = keys.map((key) => ({
          id: key,
          ...requests[key],
        }));
        console.log(requestsArray);
        setRequests(requestsArray);
      } else {
        setRequests([]);
      }
    };

    const handleFriendsData = (snapshot) => {
      const friends = snapshot.val();
      console.log(friends);
      if (friends) {
        const keys = Object.keys(friends);
        const friendsArray = keys.map((key) => ({
          id: key,
          ...friends[key],
        }));
        console.log(friendsArray);
        setFriends(friendsArray);
      } else {
        setFriends([]);
      }
    };

    onValue(requestRef, handleRequestsData);
    onValue(friendsRef, handleFriendsData);

    return () => {
      window.removeEventListener("keydown", handleEscButton);
      document.removeEventListener("click", handleClickOutside);
      clearTimeout(timer);
      off(requestRef, "value", handleRequestsData);
      off(friendsRef, "value", handleFriendsData);
    };
  }, [findFriend, usersData, messageApi, id]);

  // click on Add a friend

  const handleAddFriends = async () => {
    const randomKey = Math.random().toString(36).substring(2) + Date.now();
    const getFriendsPath = ref(
      db,
      `users/${isFoundFriend.id}/notification/invitation/` + randomKey
    );
    const pathToMyRequest = ref(db, `users/${id}/requests/` + randomKey);
    const findRequest = requests.find(
      (name) => name.friendsName === isFoundFriend.username
    );
    // console.log(findRequest.сountRequest);
    try {
      if (!findRequest) {
        await set(getFriendsPath, {
          userIcon: userData.userIcon,
          username: userData.username,
          userId: userData.id,
          message: "Wants to be your friend",
          friendsRequest: true,
          quizRequest: false,
        });
        await set(pathToMyRequest, {
          friendsIcon: isFoundFriend.userIcon,
          friendsName: isFoundFriend.username,
        });
        messageApi.open({
          type: "success",
          content: "Request has been sent",
        });
      } else {
        messageApi.open({
          type: "warning",
          content: "You have already sent a request",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: `Something wrong ${error}, try later!`,
      });
    }
  };

  // open friends/request modal

  const handleOpenFriendsModal = () => {
    setIsCheckFriends(true);
    setIsCheckRequests(false);
  };

  const handleOpenRequestModal = () => {
    setIsCheckRequests(true);
    setIsCheckFriends(false);
  };

  // open Menu

  return (
    <>
      <div className="chat-icon">
        {contextHolder}
        <div onClick={() => setIsOpenChat(true)} id="chat" className="fas">
          <WechatOutlined />
        </div>
        <div id="message-counter">
          <div className="message-container" id="counter"></div>
        </div>
      </div>
      {isOpenChat ? (
        <div id="comunication">
          <div className="container-for-message">
            <div className="line"></div>
            <div className="line2"></div>
            <div className="line3"></div>
            <div
              ref={menuRef}
              className={`menu-container-block ${
                isOpenMenu ? "show-menu" : ""
              }`}
              style={theme !== "dark" ? { background: "#eaeaea" } : {}}
            >
              <div className="menu-top-content">
                <div className="user-icon">
                  <img src={userData.userIcon} alt="user-icon" />
                </div>
                <div
                  className="user-nick"
                  style={theme !== "dark" ? { color: "#000" } : {}}
                >
                  {userData.username}
                </div>
              </div>
              <div
                className="top-line-menu-container"
                style={theme !== "dark" ? { border: "1px solid #000" } : {}}
              />

              <div
                className="menu-midle-content"
                style={theme !== "dark" ? { color: "#000" } : {}}
              >
                <div className="user-topic">
                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {theme === "dark" ? "dark_mode" : "light_mode"}
                    </span>
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </p>
                  <div className="theme-switcher">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={theme === "dark"}
                        onChange={handleThemeChange}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
                <div className="user-friends" onClick={handleOpenFriendsModal}>
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                  <p>Friends</p>
                </div>
                <FriendsModal visible={isCheckFriends} friendsData={friends} />
                <div onClick={handleOpenRequestModal} className="user-requests">
                  <span className="material-symbols-outlined">
                    contact_mail
                  </span>
                  <p>Requests</p>
                </div>
                <RequestModal
                  visible={isCheckRequests}
                  requestsData={requests}
                />
              </div>
              <div className="menu-under-content">
                <div
                  className="under-line-menu-container"
                  style={theme !== "dark" ? { border: "1px solid #000" } : {}}
                />
                <div
                  className="invitation-code"
                  style={theme !== "dark" ? { color: "#000" } : {}}
                >
                  <h3>
                    Invitation code:{" "}
                    <span
                      style={{
                        textDecoration: "underline",
                        color: "#e9f500",
                      }}
                    >
                      {userData.invitationCode}
                    </span>
                  </h3>
                </div>
              </div>
            </div>
            <div className={` ${isOpenMenu ? "background-box" : ""}`}></div>
            <div
              className="left-part-contact"
              style={theme !== "dark" ? { background: "#eaeaea" } : {}}
            >
              <div
                className="setting-for-left-header"
                style={theme !== "dark" ? { background: "#d1d1d1" } : {}}
              >
                <span
                  className="material-symbols-outlined"
                  onClick={() => setIsOpenMenu(true)}
                  id="settings"
                >
                  menu
                </span>

                <input
                  type="text"
                  placeholder="Find a chat or type friend's code invitation"
                  id="find"
                  maxLength="50"
                  value={findFriend}
                  autoComplete="off"
                  onChange={(e) => setFindFriend(e.target.value)}
                  style={{ width: "85%", height: "70%" }}
                />
              </div>
              {isFoundFriend &&
              isFoundFriend.username !== requests.friendsName ? (
                <div className="find-friends-container">
                  <div className="find-friends-block">
                    <img
                      className="friends-icon"
                      src={isFoundFriend.userIcon}
                      alt="friendIcon"
                    />
                    <div className="friends-name">{isFoundFriend.username}</div>
                    <span
                      style={{
                        color: "green",
                        fontSize: "30px",
                        cursor: "pointer",
                      }}
                      className="material-symbols-outlined"
                      onClick={handleAddFriends}
                    >
                      add_box
                    </span>
                  </div>
                  <div className="find-friends-block-line" />
                </div>
              ) : (
                ""
              )}
              <div className="chat-message-block">
                <div className="sender-icon"></div>
                <span className="sender-nick"></span>
                <span className="last-message"></span>
              </div>
            </div>
            <div className="right-part-message-window">
              <div
                className="setting-for-right-header"
                style={theme !== "dark" ? { background: "#d1d1d1" } : {}}
              >
                <div className="room-name">
                  <span
                    id="room"
                    style={theme !== "dark" ? { color: "#000" } : {}}
                  >
                    Room or nickname
                  </span>
                  <br />
                  <span
                    id="online"
                    style={theme !== "dark" ? { color: "#016f20" } : {}}
                  >
                    online
                    <li className="online-icon"></li>
                  </span>
                </div>
                <div
                  className="right-setting"
                  style={theme !== "dark" ? { color: "#016f20" } : {}}
                >
                  <span
                    id="rigth-tools"
                    style={
                      theme !== "dark"
                        ? { fontSize: "25px", color: "#000" }
                        : { fontSize: "25px", color: "#fff" }
                    }
                  >
                    <SettingOutlined />
                  </span>
                </div>
                <div
                  id="close"
                  style={
                    theme !== "dark"
                      ? { background: "#d6d6d6", color: "#000" }
                      : {}
                  }
                  onClick={() => setIsOpenChat(false)}
                >
                  <ArrowDownOutlined className="close-item" />
                </div>
              </div>
              <div className="message">
                <span className="material-symbols-outlined" id="file">
                  fingerprint
                </span>
                <input
                  type="text"
                  placeholder="Type something..."
                  id="message-input"
                  autoComplete="off"
                  // onChange={(e) => setMessage(e.target.value)}
                />
                <span className="material-symbols-outlined" id="send">
                  send
                </span>
                <span className="material-symbols-outlined" id="smail">
                  cyclone
                </span>
                {!message.length && (
                  <span className="material-symbols-outlined" id="voice">
                    keyboard_voice
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Chat;
