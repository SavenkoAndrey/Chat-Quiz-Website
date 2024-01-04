import { off, onValue, ref, remove, set, update } from "firebase/database";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../DataBase/firebase";
import sound from "../Sound/sound.mp3";

const Notification = ({ getId, invitation, userData, onClose }) => {
  const [upDateApp, setUpDateApp] = useState("");
  const soundRef = useRef(null);
  const [isAcceptNotificationRules, setIsAcceptNotificationRules] =
    useState(false);
  const isAcceptRulseAlready = localStorage.getItem("acceptRulse");

  useEffect(() => {
    if (isAcceptNotificationRules) {
      setTimeout(() => {
        if (soundRef.current) {
          soundRef.current.play();
        }
      }, 1050);
    }

    //update

    const updateRef = ref(db, `users/${getId}/notification/update`);

    const handleUpdateData = (snapshot) => {
      const upDatesApp = snapshot.val();
      setUpDateApp(upDatesApp);
    };

    onValue(updateRef, handleUpdateData);

    return () => {
      // Deleted listeners

      off(updateRef, "value", handleUpdateData);
    };
  }, [getId, isAcceptNotificationRules]);

  const UpDateNotification = () => {
    setIsAcceptNotificationRules(true);
    setTimeout(() => {
      localStorage.setItem("acceptRulse", true);
      onClose();
    }, 2000);
  };

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

    const requestQuizUpdate = ref(
      db,
      `rooms/${findNotification.roomId}/requests/${userData.id}`
    );

    if (findNotification.friendsRequest) {
      await update(requestUpdate, { acceptRequest: false });
    } else if (findNotification.quizRequest) {
      await update(requestQuizUpdate, { acceptRequest: false });
    }

    // // delete the date about invitation
    await remove(invitationReference);
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
    const requestQuizUpdate = ref(
      db,
      `rooms/${findNotification.roomId}/requests/${userData.id}`
    );
    const addFriendsToBd = ref(db, `users/${getId}/friends/` + randomKey);
    const addFriendsToBd2 = ref(
      db,
      `users/${findNotification.userId}/friends/` + randomKey
    );
    const addRoomId = ref(db, `users/${userData.id}/roomId/`);
    const acceptQuizInvite = ref(
      db,
      `rooms/${findNotification.roomId}/participants/` + userData.id
    );

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
    } else if (findNotification.quizRequest) {
      try {
        await remove(requestQuizUpdate);
        await set(acceptQuizInvite, {
          participantsName: userData.username,
          participantsIcon: userData.userIcon,
          participantsId: userData.id,
        });

        await set(addRoomId, findNotification.roomId);
      } catch (error) {
        console.error("Something wrong, try later", error);
      }
    }

    // delete the date about invitation
    await remove(invitationReference);
  };

  const closeTheUpDateNotification = async () => {
    const updatePath = `users/${getId}/notification/update`;
    const updateReference = ref(db, updatePath);

    await set(updateReference, "");
  };

  return (
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
                      Here you will receive notifications (who invited you,
                      whether you would like to accept or reject the offer), as
                      well as updates to the application about what will be
                      added or changed. Click "Ok" so that it doesn't appear
                      anymore 😊
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
  );
};

export default Notification;
