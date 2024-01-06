import React, { useEffect, useState } from "react";
import { useRef } from "react";
import notificationSound from "../Sound/notification_sound.mp3";

const NotificationWindowModal = ({
  newNotification,
  visible,
  onClose,
  isOpenNotification,
}) => {
  const [userInteracted, setUserInteracted] = useState(false);
  const noticeSoundRef = useRef(null);
  useEffect(() => {
    const handleUserInteracted = () => {
      setUserInteracted(true);
    };

    window.addEventListener("click", handleUserInteracted);

    const timeout = setTimeout(() => {
      onClose();
    }, 5000);

    if (
      noticeSoundRef.current &&
      visible &&
      userInteracted &&
      !isOpenNotification
    ) {
      noticeSoundRef.current.play();
    }

    return () => {
      clearTimeout(timeout);

      window.removeEventListener("click", handleUserInteracted);
    };
  }, [onClose, newNotification, visible, userInteracted, isOpenNotification]);

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
