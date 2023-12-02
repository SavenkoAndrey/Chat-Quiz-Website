import React from "react";

const FriendsModal = ({ visible, friendsData }) => {
  return visible ? (
    <div className="friends-modal-container">
      <div className="friends-modal-content">
        {friendsData.length > 0 ? (
          <>
            {friendsData.map((data) => (
              <div className="friends-modal-block">
                <img src={data.friendsIcon} alt="friendIcon" />
                <h4>{data.friendsName}</h4>
                <span
                  style={{
                    marginLeft: "1.5rem",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
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
