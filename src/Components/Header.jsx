import { BellOutlined, DownOutlined } from "@ant-design/icons";
import { off, onValue, ref } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../DataBase/firebase";
import UserSetting from "./UserSetting";
import { message } from "antd";
import NotificationWindowModal from "../Modal/NotificationWindowModal";
import Notification from "./Notification";

const Header = ({ getId, userData, isCreateQuiz }) => {
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const [isOpenUserSetting, setIsOpenUserSetting] = useState(false);

  const [invitation, setInvitation] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const notificationsRef = useRef(null);
  const userSettingRef = useRef(null);

  // for update user image/roomId
  const [newUserImage, setNewUserImage] = useState(userData.userIcon);
  const [newRoom, setNewRoom] = useState(userData.roomId || null);

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

    // update icon

    const handelUpdateData = (snapshot) => {
      const newImage = snapshot.val();
      const newRoom = snapshot.val();
      if (newImage) {
        setNewUserImage(newImage.userIcon);
      }
      if (newRoom) {
        setNewRoom(newRoom.roomId);
      }
    };

    onValue(invitationRef, handleData);
    onValue(usersRef, handelUpdateData);

    return () => {
      // delete esc listener
      window.removeEventListener("keydown", handleEsc);

      // Deleted listeners

      document.removeEventListener("click", handleClickOutside);
      off(invitationRef, "value", handleData);
      off(usersRef, "value", handelUpdateData);
    };
  }, [getId, prevNoticeLength]);

  const toggleNotifications = () => {
    setIsOpenNotification((prev) => !prev);
  };

  return (
    <header>
      {contextHolder}
      <nav>
        <h1>The room ID: {newRoom ? newRoom : ""}</h1>
      </nav>
      <div className="gradient-header">
        <h3>{!isCreateQuiz ? "Chat quiz" : "Welcome by Create Quiz"}</h3>
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
          roomId={newRoom}
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
                userData.notification.update.length
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
          <Notification
            userData={userData}
            invitation={invitation}
            getId={getId}
            onClose={() => setIsOpenNotification(false)}
          />
        ) : (
          ""
        )}
        <NotificationWindowModal
          newNotification={newNotification}
          visible={isNewNotification}
          onClose={closeModalWithNewNotification}
          isOpenNotification={isOpenNotification}
        />
      </div>
    </header>
  );
};

export default Header;
