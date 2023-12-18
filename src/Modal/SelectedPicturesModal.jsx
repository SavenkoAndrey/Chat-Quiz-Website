import { Form, Input, Modal } from "antd";
import React, { useState } from "react";

const SelectedPicturesModal = ({ visible, onClose, onPictureChange }) => {
  const [linkToPicture, setLinkToPicture] = useState("");

  const editPictures = () => {
    onPictureChange(linkToPicture);
    onClose();
  };

  return (
    <Modal
      title="Select Pictures"
      open={visible}
      onCancel={onClose}
      onOk={editPictures}
    >
      <Form
        name="edit-question-pictures-form"
        labelCol={{
          span: 100,
        }}
        wrapperCol={{
          span: 100,
        }}
        style={{
          maxWidth: 1000,
        }}
        onFinish={editPictures}
        autoComplete="off"
        className="edit-pictures-form"
      >
        <Form.Item
          className="edit-modal-form-input"
          label="Image URL"
          name="puctures"
        >
          <Input
            placeholder="Image URL"
            value={linkToPicture}
            onChange={(e) => setLinkToPicture(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SelectedPicturesModal;
