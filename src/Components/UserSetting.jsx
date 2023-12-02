import { CameraOutlined, FormOutlined, UserOutlined } from "@ant-design/icons";
import { ref, update } from "firebase/database";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../DataBase/firebase";
import EditIconModal from "../Modal/EditIconModal";

const UserSetting = ({ visible, name, icon, logout, id, roomId }) => {
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
  };

  const [isOpenEditIconModal, setIsOpenEditIconModal] = useState(false);
  const [userIcon, setUserIcon] = useState(icon);
  const [editName, setEditName] = useState(name);
  const [showInputEditName, setShowInputEditName] = useState(false);

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

  // General setting

  const getUserId = localStorage.getItem("userId");
  const userPath = `users/${getUserId}/`;

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
          </div>
          <div className="user-id">
            <h4>Your ID: {id}</h4>
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
