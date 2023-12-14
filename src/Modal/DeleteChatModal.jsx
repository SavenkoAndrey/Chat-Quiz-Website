import { Modal } from "antd";
import React from "react";

const DeleteChatModal = ({visible, onClose, onOk, name}) => {


  return (
    <Modal
      title="Delete Chat"
      onOk={onOk}
      open={visible}
      onCancel={onClose}
    >
      <span style={{fontSize: '18px', color: 'red'}}>Are you sure that you wanna delete chat with: </span>
      <br />
      <h2><b>{name}</b></h2>
    </Modal>
  );
};

export default DeleteChatModal;
