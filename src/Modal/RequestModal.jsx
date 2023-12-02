import React from "react";

const RequestModal = ({ visible, requestsData }) => {
  return visible ? (
    <div className="requests-modal-container">
      <div className="requests-modal-content">
        {requestsData.length > 0 ? (
          <>
            {requestsData.map((data) => (
              <div key={data.id} className="requests-modal-block">
                <img src={data.friendsIcon} alt="friendsIcon" />
                <h4>{data.friendsName}</h4>
                <div className="requests-result">
                  {data.acceptRequest === undefined ? (
                    <span className="material-symbols-outlined">
                      person_alert
                    </span>
                  ) : (
                    <span className="material-symbols-outlined">
                      {data.acceptRequest ? "person_check" : "person_cancel"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              // justifyContent: "center",
              width: "100%",
              height: '250px',
              padding: "10px 5px 0 0",
            }}
          >
            <p style={{ color: "red", paddingRight: "5px" }}>
              You don't have any requests
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

export default RequestModal;
