import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import { ref, remove, update } from "firebase/database";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../DataBase/firebase";
import EditIconModal from "../Modal/EditIconModal";
import copy from "clipboard-copy";
import { message } from "antd";

const UserSetting = ({ visible, name, icon, id, roomId, privilege }) => {
  // Styles
  const styles = {
    editNameInput: {
      border: 0,
      borderRadius: "2px",
      outline: "none",
      height: "20px",
      paddingLeft: "10px",
    },
    editNameIcon: {
      cursor: "pointer",
      fontSize: "20px",
      display: "flex",
      alignItems: "center",
    },
    leaveFromRoom: {
      cursor: "pointer",
      fontSize: "20px",
      display: "flex",
      alignItems: "center",
      paddingLeft: "10px",
    },
  };

  const [isOpenEditIconModal, setIsOpenEditIconModal] = useState(false);
  const [userIcon, setUserIcon] = useState(icon);
  const [editName, setEditName] = useState(name);
  const [showInputEditName, setShowInputEditName] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // for listen the mouse hover

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const closeTheModals = () => {
    setIsOpenEditIconModal(false);
  };

  // for copy ID when you have a click

  const handleCopyValue = (valueToCopy) => {
    copy(valueToCopy)
      .then(() => {
        messageApi.open({
          type: "success",
          content: "Copy!",
        });
      })
      .catch((error) => {
        messageApi.open({
          type: "error",
          content: error,
        });
      });
  };

  // General setting

  const getUserId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const userPath = `users/${getUserId}/`;
  const roomPath = `rooms/${roomId}/participants/${getUserId}`;

  // for edit icon

  const handleUserIconChange = async (newIcon) => {
    const updateImageReference = ref(db, userPath);

    await update(updateImageReference, { userIcon: newIcon });

    setUserIcon(newIcon);
  };

  // for edit name

  const handleEditName = async () => {
    const updateUserNameReference = ref(db, userPath);

    await update(updateUserNameReference, { username: editName });

    setEditName(editName);
    setShowInputEditName(false);
  };

  // for leave from room

  const handleLeaveFromRoom = async () => {
    const updateRoom = ref(db, userPath);
    const updateParticipants = ref(db, roomPath);
    try {
      await update(updateRoom, { roomId: null });
      await remove(updateParticipants);
    } catch (error) {
      console.error("Something went wrong: ", error);
    }
  };

  // Button`s listener

  useEffect(() => {
    const handleEnterButton = async (event) => {
      if (event.key === "Enter") {
        const updateUserNameReference = ref(db, userPath);

        await update(updateUserNameReference, { username: editName });

        setEditName(editName);
        setShowInputEditName(false);
      }
    };

    window.addEventListener("keydown", handleEnterButton);

    return () => {
      // delete listener
      window.removeEventListener("keydown", handleEnterButton);
    };
  }, [editName, userPath]);

  // log out from acc

  const navigate = useNavigate();

  const logOut = () => {
    localStorage.removeItem("userId");
    sessionStorage.removeItem("userId");

    navigate("/");
  };

  return (
    <div className={`user-setting-container ${visible ? "show" : ""}`}>
      {contextHolder}
      <div className="user-setting-content">
        <div className="user-setting-context">
          <div className="user-icon">
            {icon.length ? (
              <img src={userIcon} alt="userIcon" />
            ) : (
              <UserOutlined />
            )}
          </div>
          <div
            className="edit-icon-block"
            onClick={() => setIsOpenEditIconModal(true)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isHovered && <CameraOutlined className="edit-icon" />}
          </div>

          <EditIconModal
            visible={isOpenEditIconModal}
            onClose={closeTheModals}
            onIconChange={handleUserIconChange}
          />

          <div className="user-name">
            <h4 style={{ paddingRight: "10px" }}>
              Name:{" "}
              {!showInputEditName ? (
                editName
              ) : (
                <input
                  style={styles.editNameInput}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              )}
            </h4>
            {!showInputEditName ? (
              <span
                id="edit-name"
                style={styles.editNameIcon}
                onClick={() => setShowInputEditName(true)}
                className="material-symbols-outlined"
              >
                edit_square
              </span>
            ) : (
              <span
                id="edit-name"
                onClick={handleEditName}
                style={{ color: "green", cursor: "pointer" }}
              >
                ✔
              </span>
            )}
          </div>
          <div className="user-room-id">
            <h4>Room ID: {roomId}</h4>
            {roomId && (
              <span
                onClick={handleLeaveFromRoom}
                style={styles.leaveFromRoom}
                className="material-symbols-outlined"
              >
                logout
              </span>
            )}
          </div>
          <div className="user-room-id">
            <h4>
              Privilege: <span style={{ color: "red" }}>{privilege}</span>
            </h4>
          </div>
          <div className="user-id">
            <h4 onClick={() => handleCopyValue(id)}>
              Your ID:{" "}
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                {id}
              </span>{" "}
            </h4>
          </div>
          <div className="logout-button-block">
            <button onClick={logOut} className="logout-button">
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSetting;
