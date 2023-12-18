import {
  ArrowDownOutlined,
  SettingOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { message as noticeMessage } from "antd";
import FriendsModal from "../Modal/FriendsModal";
import { off, onValue, ref, remove, set, update } from "firebase/database";
import { db } from "../DataBase/firebase";
import RequestModal from "../Modal/RequestModal";
import io from "socket.io-client";
import moment from "moment";
import DeleteChatModal from "../Modal/DeleteChatModal";
import InputEmoji from "react-input-emoji";

// implementation socket logic

const socket = io.connect("http://localhost:3001");

const Chat = ({ userData, usersData, id }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme"));
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isOpenChatSetting, setIsOpenChatSetting] = useState(false);
  const [isDeleteChatSetting, setIsDeleteChatSetting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState([]);
  const [messageApi, contextHolder] = noticeMessage.useMessage();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const scrollRef = useRef(null);

  // friend's state

  const [isCheckFriends, setIsCheckFriends] = useState(false);
  const [findFriend, setFindFriend] = useState("");
  const [isFoundFriend, setIsFoundFriend] = useState(null);
  const [friends, setFriends] = useState([]);

  // messages array, path/ref

  // the fn for find a chat and make active block
  const [activeFriendsBlock, setActiveFriendsBlock] = useState(null);
  const [newMessageLength, setNewMessageLength] = useState(0);
  // const [isReadMessage, setIsReadMessage] = useState(false);
  const chatData = friends.find((chat) => chat.id === activeFriendsBlock);

  const isOnline =
    activeFriendsBlock &&
    onlineUsers.some((users) => users.userId === chatData.friendsId);

  const handleBlockClick = (id) => {
    if (activeFriendsBlock === id) {
      setActiveFriendsBlock(null);
      setIsOpenChatSetting(false);
    } else {
      setActiveFriendsBlock(id);
    }
  };
  // if (chatData && newMessageLength === 0) {
  //   setIsReadMessage(true);

  // } else {
  //   setIsReadMessage(false);
  // }
  // setNewMessageLength(newMessagesArray.length);

  // create a message block for friends when it's clicked and have check last message

  const messagesArray = [];

  for (let i = 0; i < friends.length; i++) {
    if (friends[i].messages !== undefined) {
      messagesArray.push(friends[i]);
    }
  }
  // console.log(newMessageLength);

  const lastMessages = friends
    .map((friend) => {
      const messages = friend.messages || [];
      const messagesArray = Object.values(messages);
      const sortLastMessage = messagesArray.sort((a, b) => {
        return a.numberMessage - b.numberMessage;
      });

      // if (messagesArray.length > newMessageLength) {
      //   // if (!isReadMessage && !isOnline) {
      //   // setNewMessageLength(messagesArray.length);
      //   console.log(messagesArray.length);
      // } else {
      //   // setNewMessageLength(0);
      //   // setIsReadMessage(true)
      //   console.log(0);
      //   // }
      // }

      const lastMessage =
        messagesArray.length > 0
          ? sortLastMessage[sortLastMessage.length - 1]
          : null;

      return {
        friendsId: friend.friendsId,
        lastMessage: lastMessage,
        friendsIcon: friend.friendsIcon,
        friendsName: friend.friendsName,
        chatsId: friend.id,
        // newMessagesCount: newMessageLength,
        // isReadMessage: isReadMessage,
      };
    })
    .filter((message) => message.lastMessage !== null);

  // request's state

  const [isCheckRequests, setIsCheckRequests] = useState(false);
  const [requests, setRequests] = useState([]);

  const menuRef = useRef(null);

  // for Theme change

  const handleThemeChange = () => {
    setIsDarkTheme(!isDarkTheme);

    // save the selection
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

    const getTheme = localStorage.getItem("theme");
    setTheme(getTheme);
  };

  useLayoutEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }, 100);
    }
  }, [activeFriendsBlock]);

  // socket io effect fn for initial
  useEffect(() => {
    const handleSendMessageButton = async (event) => {
      if (event.key === "Enter" && activeFriendsBlock) {
        if (message.length > 0 && chatData !== undefined) {
          // socket.emit("send_message", { message, activeFriendsBlock });
          const randomMessageKey =
            Math.random().toString(36).substring(2) + Date.now();

          const messageTime = moment(message.createdAt).format("HH:mm");
          const dispatchTime = moment(message.createdAt).format("HH:mm:ss");
          const messageTimestamp = moment(dispatchTime, "HH:mm:ss").valueOf();

          const messageUserRef = ref(
            db,
            `users/${id}/friends/${chatData.id}/messages/` + randomMessageKey
          );
          const messageFriendRef = ref(
            db,
            `users/${chatData.friendsId}/friends/${chatData.id}/messages/` +
              randomMessageKey
          );
          // const isReadMessageRef = ref(
          //   db,
          //   `users/${id}/friends/${chatData.id}/`
          // );

          try {
            await update(messageUserRef, {
              message: message,
              senderIcon: userData.userIcon,
              senderId: id,
              messageTime: messageTime,
              numberMessage: messageTimestamp,
            });
            await update(messageFriendRef, {
              message: message,
              senderIcon: userData.userIcon,
              senderId: id,
              messageTime: messageTime,
              numberMessage: messageTimestamp,
            });

            // if(messagesArray) {
            //   await update(isReadMessageRef, {isReadMessage: false})
            // }
          } catch (error) {
            console.error(error);
          }

          // effect for auto scroll to bottom
          if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest",
            });
          }
          setMessage("");
        } else {
          messageApi.open({
            type: "error",
            content: "Select chat",
          });
        }
      }
    };

    // add online users

    if (socket === null) return;
    socket.emit("addNewUser", id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });

    // get message from socket

    // socket.on("receive_message", (data) => {
    //   setMessageReceived(data);
    //   console.log(data);
    // });

    document.addEventListener("keydown", handleSendMessageButton);

    return () => {
      document.removeEventListener("keydown", handleSendMessageButton);
      socket.off("getOnlineUsers");
    };
  }, [
    activeFriendsBlock,
    chatData,
    friends,
    id,
    message,
    messageApi,
    userData,
  ]);

  // sort all of message use the dispatch time of it

  const sortedMessages = messageReceived.sort((a, b) => {
    return a.numberMessage - b.numberMessage;
  });

  // receive message

  useEffect(() => {
    // if (socket === null) return;
    // socket.on("receive_message", (res) => {
    //   // if (chatData.id !== res.chatData.id) return;

    //   // setMessageReceived((prev) => [...prev, res]);
    //   console.log(res);
    // });

    // get new message and make a key
    if (chatData) {
      const messageRef = ref(
        db,
        `users/${userData.id}/friends/${chatData.id}/messages`
      );

      const handleData = (snapshot) => {
        const messages = snapshot.val();
        if (messages) {
          const keys = Object.keys(messages);
          const newMessagesArray = keys.map((key) => ({
            id: key,
            ...messages[key],
          }));
          if (!chatData.isReadMessage) {
            const newMessages = newMessagesArray[newMessagesArray.length - 1];
            console.log(newMessages);
            setNewMessageLength(newMessagesArray.length);
          } else {
            setNewMessageLength(0);
          }
          setMessageReceived(newMessagesArray);
        } else {
          setMessageReceived([]);
        }
      };

      onValue(messageRef, handleData);

      return () => {
        // socket.off("receive_message");
        off(messageRef, "value", handleData);
      };
    }
  }, [chatData, newMessageLength, userData]);

  useEffect(() => {
    // click on the keybutton
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
      } else {
        setIsFoundFriend(null);
      }
    }, 300);

    // get new data

    const requestRef = ref(db, `users/${id}/requests`);
    const friendsRef = ref(db, `users/${id}/friends`);

    const handleRequestsData = (snapshot) => {
      const requests = snapshot.val();

      if (requests) {
        const keys = Object.keys(requests);
        const requestsArray = keys.map((key) => ({
          id: key,
          ...requests[key],
        }));
        setRequests(requestsArray);
      } else {
        setRequests([]);
      }
    };

    const handleFriendsData = (snapshot) => {
      const friends = snapshot.val();
      if (friends) {
        const keys = Object.keys(friends);
        const friendsArray = keys.map((key) => ({
          id: key,
          ...friends[key],
        }));
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
  }, [findFriend, usersData, messageApi, id, message, isOpenChatSetting]);

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
          friendsId: isFoundFriend.id,
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

  // Socket io

  const sendMessage = () => {
    if (chatData !== undefined && activeFriendsBlock) {
      // socket.emit("send_message", { message, chatData });

      setMessage("");
    } else {
      messageApi.open({
        type: "error",
        content: "Select chat",
      });
    }
  };

  // setting modal

  const handleCloseDeleteModalSetting = () => {
    setIsDeleteChatSetting(false);
  };

  const handleAcceptDeleteChat = async () => {
    if (!isDeleteChatSetting) return;

    const getPathToChat = ref(
      db,
      `users/${id}/friends/${chatData.id}/messages`
    );
    try {
      await remove(getPathToChat);
      setIsDeleteChatSetting(false);
      setIsOpenChatSetting(false);
      setActiveFriendsBlock(null);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Try later!",
        error,
      });
    }
  };

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
                <FriendsModal
                  visible={isCheckFriends}
                  onClose={() => setIsOpenMenu(false)}
                  friendsData={friends}
                  isOnlineFriends={onlineUsers}
                  userId={id}
                  isActiveFriendsBlock={setActiveFriendsBlock}
                />
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
                    Invitation code:
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
                <div key={isFoundFriend.id} className="find-friends-container">
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
              {lastMessages.length ? (
                <>
                  {lastMessages.map((sender) => (
                    <div
                      key={sender.id}
                      className={`chats-message-block ${
                        activeFriendsBlock === sender.chatsId ? "active" : ""
                      }`}
                      onClick={() =>
                        handleBlockClick(sender.chatsId, sender.friendsName)
                      }
                    >
                      <div className="chats-message-sender-data">
                        <div className="chats-message-icon-block">
                          <img
                            className="sender-icon"
                            src={sender.friendsIcon}
                            alt="senderIcon"
                          />
                        </div>
                        <div className="chats-message-text-block">
                          <div className="chats-message-data-block">
                            <span className="sender-nick">
                              {sender.friendsName}
                            </span>

                            <p>{sender.lastMessage.messageTime}</p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                maxWidth: "80%",
                                fontSize: "20px",
                                color: "#fff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {sender.lastMessage.message}
                            </span>
                            <span
                              style={
                                isOnline
                                  ? {
                                      fontSize: "15px",
                                      color: "#bdbdbd8e",
                                      position: "relative",
                                      top: "25px",
                                      height: "50px",
                                      wordSpacing: "-10px",
                                    }
                                  : {
                                      fontSize: "15px",
                                      color: "green",
                                      position: "relative",
                                      top: "25px",
                                      height: "50px",
                                      wordSpacing: "-10px",
                                    }
                              }
                            >
                              <b>✔ ✔</b>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {messagesArray.map((sender) => (
                    <div
                      key={sender.chatsId}
                      className={`chats-message-block ${
                        activeFriendsBlock === sender.id ? "active" : ""
                      }`}
                      onClick={() =>
                        handleBlockClick(sender.id, sender.friendsName)
                      }
                    >
                      <div className="chats-message-sender-data">
                        <div className="chats-message-icon-block">
                          <img
                            className="sender-icon"
                            src={sender.friendsIcon}
                            alt="senderIcon"
                          />
                        </div>
                        <div className="chats-message-text-block">
                          <div className="chats-message-data-block">
                            <span className="sender-nick">
                              {sender.friendsName}
                            </span>

                            <p>DD/HH/mm</p>
                          </div>

                          <span style={{ fontSize: "20px", color: "#fff" }}>
                            Messages...
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
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
                    {activeFriendsBlock ? chatData.friendsName : "You are"}
                  </span>
                  <br />
                  <span
                    id="online"
                    style={theme !== "dark" ? { color: "#016f20" } : {}}
                  >
                    {activeFriendsBlock ? (
                      <>
                        {isOnline ? (
                          <div id="online">
                            <p>online</p>
                            <li className="online-icon"></li>
                          </div>
                        ) : (
                          <div style={{ color: "red" }}>offline</div>
                        )}
                      </>
                    ) : (
                      <div id="online">
                        <p>online</p>
                        <li className="online-icon"></li>
                      </div>
                    )}
                  </span>
                </div>
                <div
                  className="chats-setting"
                  style={
                    theme !== "dark" ? { color: "#000" } : { color: "#fff" }
                  }
                >
                  <span
                    className={`material-symbols-outlined ${
                      isOpenChatSetting ? "show-delete-setting" : ""
                    }`}
                    id="delete-chat"
                    onClick={() => setIsDeleteChatSetting(true)}
                  >
                    delete
                  </span>
                  {isDeleteChatSetting && (
                    <DeleteChatModal
                      visible={isDeleteChatSetting}
                      onClose={handleCloseDeleteModalSetting}
                      onOk={handleAcceptDeleteChat}
                      name={chatData.friendsName}
                    />
                  )}
                  <span
                    className={`material-symbols-outlined ${
                      isOpenChatSetting ? "show-call-setting" : ""
                    }`}
                    id="call-friend"
                  >
                    call
                  </span>
                  <span
                    className={`material-symbols-outlined ${
                      isOpenChatSetting ? "show-find-setting" : ""
                    }`}
                    id="find-by-chat"
                  >
                    search
                  </span>
                </div>

                <div
                  className="right-setting"
                  style={theme !== "dark" ? { color: "#016f20" } : {}}
                >
                  <span
                    id="rigth-tools"
                    className={`${
                      isOpenChatSetting ? "setting-animation" : ""
                    }`}
                    style={
                      theme !== "dark"
                        ? { fontSize: "25px", color: "#000" }
                        : { fontSize: "25px", color: "#fff" }
                    }
                  >
                    {activeFriendsBlock && (
                      <SettingOutlined
                        onClick={() => setIsOpenChatSetting(!isOpenChatSetting)}
                      />
                    )}
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
              <div className="messages">
                {activeFriendsBlock ? (
                  <>
                    {messageReceived.length > 0 ? (
                      <>
                        {sortedMessages.map((messageData) => (
                          <>
                            {messageData.senderId !== id ? (
                              <div
                                key={messageData.id}
                                className={`messages-block`}
                                ref={scrollRef}
                              >
                                <img
                                  src={messageData.senderIcon}
                                  className="messages-users-image"
                                  alt="usersImages"
                                />
                                <div className="received-message">
                                  <p
                                    style={{
                                      wordBreak: "normal",
                                      width: "90%",
                                    }}
                                  >
                                    {messageData.message}
                                  </p>
                                  <div
                                    style={{
                                      display: "flex",
                                      width: "120px",
                                      margin: "0 1rem 0 0rem",
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: "17px",
                                        wordBreak: "keep-all",
                                        padding: "1.1rem 0 0 .8rem",
                                        color: "#515b5e",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                      }}
                                    >
                                      {messageData.messageTime}
                                    </p>
                                    <span
                                      style={{
                                        fontSize: "15px",
                                        color: "#fff",
                                        wordSpacing: "-11px",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        width: "40px",
                                      }}
                                    >
                                      ✔ ✔
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                key={messageData.id}
                                className={`messages-my-block`}
                                ref={scrollRef}
                              >
                                <div className="received-message">
                                  <p
                                    style={{
                                      wordBreak: "normal",
                                      width: "90%",
                                    }}
                                  >
                                    {messageData.message}
                                  </p>
                                  <div
                                    style={{
                                      display: "flex",
                                      width: "120px",
                                      margin: "0 1rem 0 0rem",
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: "17px",
                                        wordBreak: "keep-all",
                                        padding: "1.1rem 0 0 .8rem",
                                        color: "#686868",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                      }}
                                    >
                                      {messageData.messageTime}
                                    </p>
                                    <span
                                      style={{
                                        fontSize: "15px",
                                        color: "#fff",
                                        wordSpacing: "-11px",
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        width: "40px",
                                      }}
                                    >
                                      ✔ ✔
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        ))}
                      </>
                    ) : (
                      <p
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "90%",
                          fontSize: "30px",
                        }}
                      >
                        Type your first message
                      </p>
                    )}
                  </>
                ) : (
                  <p
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "90%",
                      fontSize: "30px",
                    }}
                  >
                    Choose a chat please...
                  </p>
                )}
              </div>
              {activeFriendsBlock && (
                <div className="message-container-block">
                  <span className="material-symbols-outlined" id="file">
                    fingerprint
                  </span>
                  {/* <input
                  type="text"
                  placeholder="Type something..."
                  id="message-input"
                  autoComplete="off"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                /> */}

                  {/* <span className="material-symbols-outlined" id="smail">
                  cyclone 
                </span> */}
                  <InputEmoji value={message} onChange={setMessage} />
                  <span
                    onClick={sendMessage}
                    className="material-symbols-outlined"
                    id="send"
                  >
                    send
                  </span>
                  {!message.length && (
                    <span className="material-symbols-outlined" id="voice">
                      keyboard_voice
                    </span>
                  )}
                </div>
              )}
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
