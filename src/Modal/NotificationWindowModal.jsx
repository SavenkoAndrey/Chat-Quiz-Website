// import React, { useEffect, useState } from "react";

// const NotificationWindowModal = ({ notificationData }) => {
//   const [visible, setVisible] = useState(true);
//   const [newNotification, setNewNotification] = useState([])

//   useEffect(() => {


//     if(newNotification.length) {

//     }

//     const timeout = setTimeout(() => {
//       setVisible(false);
//     }, 5000); // Уведомление исчезнет через 5 секунд

//     return () => clearTimeout(timeout);
//   }, []);

//   return (
//     <>
//       {visible && (
//         <>
//           {notificationData.map((notice) => (
//             <div key={notice.id} className="notification-window-container">
//               <div className="notification-window-content">
//                 <div className="notification-window-header">
//               {/* <h1>New Notification</h1> */}
//               <span onClick={() => setVisible(false)}><b>x</b></span>
//             </div>
//                 <div className="notification-window-context">
//                   <img src={notice.userIcon} alt="noticIcon" />
//                   <div className="notification-window-top-context">
//                     <h2>{notice.username}</h2>
//                     <p>
//                       {notice.message}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </>
//       )}
//     </>
//   );
// };

// export default NotificationWindowModal;
