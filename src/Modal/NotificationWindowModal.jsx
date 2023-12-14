import React, { useEffect } from "react";
import { useRef } from "react";
import notificationSound from "../Sound/notification_sound.mp3";

const NotificationWindowModal = ({ newNotification, visible, onClose }) => {
  const noticeSoundRef = useRef(null);

  useEffect(() => {
    if (noticeSoundRef.current && visible) {
      noticeSoundRef.current.play();
    }

    const timeout = setTimeout(() => {
      onClose();

    }, 5000);

    return () => clearTimeout(timeout);
  }, [onClose, newNotification, visible]);

  return visible ? (
    <div className="notification-window-container">
      <audio src={notificationSound} ref={noticeSoundRef} />
      <div className="notification-window-content">
        <div className="notification-window-header">
          <span onClick={onClose}>
            <b>x</b>
          </span>
        </div>
        <div className="notification-window-context">
          <img src={newNotification.userIcon} alt="noticIcon" />
          <div className="notification-window-top-context">
            <h2>{newNotification.username}</h2>
            <p>{newNotification.message}</p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};

export default NotificationWindowModal;
