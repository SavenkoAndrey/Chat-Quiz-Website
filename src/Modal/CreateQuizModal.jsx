import { Form, Input, Modal } from "antd";
import React, { useState } from "react";

const CreateQuizModal = ({ visible, onOk, onClose }) => {
  const [quizIcon, setQuizIcon] = useState("");
  const [quizName, setQuizName] = useState("");

  const okCreate = () => {
    onOk({ quizIcon, quizName });
  };

  return (
    <Modal onCancel={onClose} onOk={okCreate} open={visible} title="Quiz">
      <Form
        name="quizCreator"
        labelCol={{
          span: 100,
        }}
        wrapperCol={{
          span: 100,
        }}
        style={{
          maxWidth: 1000,
        }}
        onFinish={okCreate}
        autoComplete="off"
        className="registration-form"
      >
        <Form.Item
          title="Icon"
          label="Please input quiz icon link"
          name="quizIcon"
          validateTrigger="onBlur"
          style={{ height: "90px", marginBottom: "0px" }}
          rules={[
            {
              required: true,
              value: 'is required'
            },
          ]}
        >
          <Input
            onChange={(e) => setQuizIcon(e.target.value)}
            placeholder="Choose icon: "
          />
        </Form.Item>
        <Form.Item
          title="Nick"
          label="Please input quiz name: "
          name="quizName"
          validateTrigger="onBlur"
          style={{ height: "90px", marginBottom: "0px" }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input
            onChange={(e) => setQuizName(e.target.value)}
            placeholder="Choose NickName: "
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateQuizModal;
