import { ref, update } from "firebase/database";
import React from "react";
import { db } from "../DataBase/firebase";

const FriendsModal = ({
  visible,
  onClose,
  friendsData,
  isOnlineFriends,
  userId,
  isActiveFriendsBlock,
}) => {
  // start chating fn

  const startChatWithFriend = async (chatId) => {
    // save the chat with friend to bd
    const findMessages = friendsData.find((e) => e.id === chatId);
    const isMessages = findMessages.messages;

    const chatUserRef = ref(db, `users/${userId}/friends/${chatId}/`);
    if (isMessages === undefined) {
      try {
        await update(chatUserRef, { messages: "" });
      } catch (error) {
        console.error("Something wrong = ", error);
      }
    }
    onClose();
    isActiveFriendsBlock(chatId);
  };

  return visible ? (
    <div className="friends-modal-container">
      <div className="friends-modal-content">
        {friendsData.length > 0 ? (
          <>
            {friendsData.map((data) => (
              <div key={data.id} className="friends-modal-block">
                <div
                  className="status-online"
                  style={
                    isOnlineFriends.some(
                      (users) => users.userId === data.friendsId
                    )
                      ? { width: "42px", height: "40px" }
                      : { width: "auto", height: "auto" }
                  }
                >
                  <img src={data.friendsIcon} alt="friendIcon" />
                  {isOnlineFriends.some(
                    (users) => users.userId === data.friendsId
                  ) ? (
                    <div className="online-friends-icon" />
                  ) : (
                    ""
                  )}
                </div>
                <h4>{data.friendsName}</h4>
                <span
                  style={{
                    marginLeft: "1.5rem",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                  onClick={() => startChatWithFriend(data.id)}
                  className="material-symbols-outlined"
                >
                  maps_ugc
                </span>
              </div>
            ))}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "250px",
            }}
          >
            <p style={{ color: "red", paddingRight: "10px" }}>
              You don't have any friends
            </p>
            <span className="material-symbols-outlined">
              sentiment_dissatisfied
            </span>
          </div>
        )}
      </div>
    </div>
  ) : (
    ""
  );
};

export default FriendsModal;
