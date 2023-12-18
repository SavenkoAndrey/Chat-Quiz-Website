import { BellOutlined, DownOutlined } from "@ant-design/icons";
import { off, onValue, ref, remove, set, update } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import sound from "../Sound/sound.mp3";
import { db } from "../DataBase/firebase";
import UserSetting from "./UserSetting";
import { message } from "antd";
import NotificationWindowModal from "../Modal/NotificationWindowModal";

const Header = ({ getId, userData, isCreateQuiz }) => {
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const [isOpenUserSetting, setIsOpenUserSetting] = useState(false);
  const [isAcceptNotificationRules, setIsAcceptNotificationRules] =
    useState(false);
  const [invitation, setInvitation] = useState([]);
  const [upDateApp, setUpDateApp] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const notificationsRef = useRef(null);
  const soundRef = useRef(null);
  const userSettingRef = useRef(null);

  // for update user image
  const [newUserImage, setNewUserImage] = useState(userData.userIcon);

  // Notification

  // new notification
  const [isNewNotification, setIsNewNotification] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [prevNoticeLength, setPrevNoticeLength] = useState(0);


  const closeModalWithNewNotification = () => {
    setIsNewNotification(false);
  };

  useEffect(() => {
    // Notification
    const handleClickOutside = (event) => {
      if (notificationsRef.current) {
        const isOutsideNotification = !notificationsRef.current.contains(
          event.target
        );
        const isOkButton = event.target.id === "close-notification";
        const isCloseUpDateAppButton = event.target.id === "cancel-update-btn";

        const isRejectButton = event.target.id === "reject-button";

        if (
          isOutsideNotification &&
          !isOkButton &&
          !isRejectButton &&
          !isCloseUpDateAppButton
        ) {
          setIsOpenNotification(false);
        }
      }
      if (userSettingRef.current) {
        const isOutsideUserSetting = !userSettingRef.current.contains(
          event.target
        );
        const isLogOutButton = event.target.className === ".logout-button";
        const isIconBlock = event.target.id === "user-icon";
        const isEditNameButton = event.target.id === "edit-name";

        if (
          isOutsideUserSetting &&
          !isLogOutButton &&
          !isIconBlock &&
          !isEditNameButton
        ) {
          setIsOpenUserSetting(false);
        }
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsOpenNotification(false);
        setIsOpenUserSetting(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    document.addEventListener("click", handleClickOutside);

    // add listener

    // real time update

    const invitationRef = ref(db, `users/${getId}/notification/invitation`);
    const updateRef = ref(db, `users/${getId}/notification/update`);
    const usersRef = ref(db, `users/${getId}`);

    // get update notification from BD and message not.
    //invitation

    const handleData = (snapshot) => {
      const invitations = snapshot.val();
      if (invitations) {
        const keys = Object.keys(invitations);
        const invitationArray = keys.map((key) => ({
          id: key,
          ...invitations[key],
        }));
        setInvitation(invitationArray);

        if (invitationArray.length > prevNoticeLength) {
          const newNotification = invitationArray[invitationArray.length - 1];
          setNewNotification(newNotification);
          setIsNewNotification(true);
        } else if (invitationArray.length < prevNoticeLength) {
          setIsNewNotification(false);
        }
        setPrevNoticeLength(invitationArray.length);
      } else {
        setInvitation([]);
        setPrevNoticeLength(0);
      }
    };

    //update

    const handleUpdateData = (snapshot) => {
      const upDatesApp = snapshot.val();
      setUpDateApp(upDatesApp);
    };

    // update icon

    const handelUpdateImage = (snapshot) => {
      const newImage = snapshot.val();
      if (newImage) {
        setNewUserImage(newImage.userIcon);
      }
    };

    onValue(invitationRef, handleData);
    onValue(updateRef, handleUpdateData);

    onValue(usersRef, handelUpdateImage);

    return () => {
      // delete esc listener
      window.removeEventListener("keydown", handleEsc);

      // Deleted listeners

      document.removeEventListener("click", handleClickOutside);
      off(invitationRef, "value", handleData);
      off(updateRef, "value", handleUpdateData);
      off(usersRef, "value", handelUpdateImage);
    };
  }, [getId, prevNoticeLength]);

  const toggleNotifications = () => {
    setIsOpenNotification((prev) => !prev);
  };

  const isAcceptRulseAlready = localStorage.getItem("acceptRulse");

  const UpDateNotification = () => {
    setIsAcceptNotificationRules(true);
    setTimeout(() => {
      localStorage.setItem("acceptRulse", true);
      setIsOpenNotification(false);
    }, 2000);
  };

  if (isAcceptNotificationRules) {
    setTimeout(() => {
      if (soundRef.current) {
        soundRef.current.play();
      }
    }, 1050);
  }

  console.log(invitation);

  // for reject and accept button

  const rejectInvitation = async (invitationId) => {
    const invitationPath = `users/${getId}/notification/invitation/${invitationId}`;
    const invitationReference = ref(db, invitationPath);
    const findNotification = invitation.find(
      (notice) => notice.id === invitationId
    );

    const requestUpdate = ref(
      db,
      `users/${findNotification.userId}/requests/${findNotification.id}`
    );

    if (findNotification.friendsRequest) {
      await update(requestUpdate, { acceptRequest: false });
    }else if(findNotification.quizRequest){
      // await update(requestUpdate, { acceptRequest: false });
    }

    // // delete the date about invitation
    await remove(invitationReference);
  };

  const closeTheUpDateNotification = async () => {
    const updatePath = `users/${getId}/notification/update`;
    const updateReference = ref(db, updatePath);

    await set(updateReference, "");
  };

  const acceptInvitation = async (invitationId) => {
    const invitationPath = `users/${getId}/notification/invitation/${invitationId}`;
    const invitationReference = ref(db, invitationPath);
    const findNotification = invitation.find(
      (notice) => notice.id === invitationId
    );

    const randomKey = Math.random().toString(36).substring(2) + Date.now();

    const requestUpdate = ref(
      db,
      `users/${findNotification.userId}/requests/${findNotification.id}`
    );
    const addFriendsToBd = ref(db, `users/${getId}/friends/` + randomKey);
    const addFriendsToBd2 = ref(
      db,
      `users/${findNotification.userId}/friends/` + randomKey
    );
    const acceptQuizInvite = ref(db, `rooms/${findNotification.roomId}/participants/` + randomKey
    );
    console.log(findNotification);

    if (findNotification.friendsRequest) {
      try {
        await update(requestUpdate, { acceptRequest: true });
        await set(addFriendsToBd, {
          friendsName: findNotification.username,
          friendsIcon: findNotification.userIcon,
          friendsId: findNotification.userId,
        });
        await set(addFriendsToBd2, {
          friendsName: userData.username,
          friendsIcon: userData.userIcon,
          friendsId: userData.id,
        });
      } catch (error) {
        console.error("Something wrong, try later", error);
      }
    }else if(findNotification.quizRequest) {
      try {
        // await update(requestUpdate, { acceptRequest: true });
        await set(acceptQuizInvite, {
          friendsName: userData.username,
          friendsIcon: userData.userIcon,
          friendsId: userData.id,
        });
        console.log('sussec');
      } catch (error) {
        console.error("Something wrong, try later", error);
      }
    }

   // delete the date about invitation
    await remove(invitationReference);
  };

  return (
    <header>
      {contextHolder}
      <nav>
        <h1>The room ID: </h1>
      </nav>
      <div className="gradient-header">
        
        <h3>{!isCreateQuiz ? "Chat quiz" : 'Welcome by Create Quiz'}</h3>
      </div>
      <div className="user-icon-block">
        <div
          className="user-icon"
          onClick={() => setIsOpenUserSetting(true)}
          style={{ cursor: "pointer", zIndex: "4" }}
        >
          <img id="user-icon" src={newUserImage} alt="userIcon"></img>
        </div>
      </div>
      <div ref={userSettingRef} className="user-setting-block">
        <UserSetting
          visible={isOpenUserSetting}
          name={userData.username}
          icon={userData.userIcon}
          id={getId}
          privilege={userData.privilege}
        />
      </div>
      <div ref={notificationsRef} className="notification">
        <div className="notification-img">
          <div className="holder">
            <DownOutlined />
          </div>
          <BellOutlined onClick={toggleNotifications} />
          {invitation.length > 0 && (
            <div
              style={
                upDateApp.length
                  ? { background: "blue" }
                  : { background: "red" }
              }
              className="quantity-notification"
            >
              <p>{invitation.length}</p>
            </div>
          )}
        </div>
        {isOpenNotification ? (
          <div className="container-notification">
            <div className="container-notification-block">
              <div className="content-notification">
                <div className="notification-header">
                  <h1>Notification</h1>
                </div>
                <div className="effect-line1"></div>
                <div className="notification-information">
                  {!isAcceptRulseAlready ? (
                    <div id="rules">
                      {!isAcceptNotificationRules ? (
                        <div>
                          <h1 id="header-info">Rules</h1>
                          <span id="information">
                            Here you will receive notifications (who invited
                            you, whether you would like to accept or reject the
                            offer), as well as updates to the application about
                            what will be added or changed. Click "Ok" so that it
                            doesn't appear anymore 😊
                          </span>
                          <button
                            id="close-notification"
                            onClick={UpDateNotification}
                          >
                            Ok
                          </button>
                        </div>
                      ) : (
                        <div className="Greate">
                          <div className="roll-effect-circle">
                            <div className="roll-effect">
                              <div className="roll"> </div>
                            </div>
                          </div>
                          <audio
                            ref={soundRef}
                            src={sound}
                            type="notice-rulse-sound.mpeg"
                          />
                          <label className="checkbox">
                            <input type="checkbox" name="check" />
                            <svg
                              version="1.1"
                              className="checkbox_svg"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              x="0px"
                              y="0px"
                              viewBox="-5 0 110 100"
                              style={{ enableBackground: "new 0 0 100 100" }}
                              xmlSpace="preserve"
                            >
                              <polyline
                                className="checkbox_line"
                                points="3.5,51.5 40.5,82.5 96.7,15.3 "
                              />
                            </svg>
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {invitation.length > 0 || upDateApp.length > 0 ? (
                        <div className="notification-block">
                          {upDateApp.length > 0 && (
                            <>
                              <div className="update-message-block">
                                <div className="cancel-update-button-block">
                                  <button
                                    onClick={closeTheUpDateNotification}
                                    id="cancel-update-btn"
                                  >
                                    x
                                  </button>
                                </div>
                                <div className="update-message">
                                  <p>{upDateApp}</p>
                                </div>
                                <a className="update-link" href="/">
                                  v1.0.1
                                </a>
                              </div>
                              <div
                                style={{ marginTop: "20px" }}
                                className="effect-line1"
                              ></div>
                            </>
                          )}
                          {invitation.map((inv) => (
                            <div key={inv.id} className="invitation-block">
                              <div className="inviter-icon">
                                <img src={inv.userIcon} alt="inviterIcon" />
                              </div>
                              <div className="inviter-name">
                                <h4>{inv.username}</h4>
                              </div>
                              <div className="inviter-message">
                                <p>{inv.message}</p>
                              </div>
                              <div className="invitation-buttons-block">
                                <div
                                  className="accept-btn"
                                  onClick={() => acceptInvitation(inv.id)}
                                >
                                  <button>✓</button>
                                </div>
                                <div className="reject-btn-block">
                                  <button
                                    id="reject-button"
                                    onClick={() => rejectInvitation(inv.id)}
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        "No any notification"
                      )}
                    </>
                  )}
                </div>
                <div className="app-version">
                  <span>v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        <NotificationWindowModal
          newNotification={newNotification}
          visible={isNewNotification}
          onClose={closeModalWithNewNotification}
        />
      </div>
    </header>
  );
};

export default Header;
