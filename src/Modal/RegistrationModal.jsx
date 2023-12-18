import React, { useState } from "react";
import { Form, Input, Modal } from "antd";
import { KeyOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { db } from "../DataBase/firebase";
import { ref, set } from "firebase/database";

const RegistrationModal = ({ visible, onCancel }) => {
  const [userData, setUserData] = useState("");
  const [userMail, setUserMail] = useState("");
  const [password, setPassword] = useState("");
  const [confrimPassword, setConfirmPassword] = useState("");

  // for generation invintation Code

  const invitationCode = Math.floor(Math.random().toString(10).substring(8));

  // RexExp for input

  const userRegex = /^[a-zA-Z-]{2,15}\s+[a-zA-Z]{2,15}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

  // For userID that remember who are registration already

  const userId = Math.random().toString(36).substring(2) + Date.now();

  // get BD

  const reference = ref(db, "users/" + userId);

  const addUsersToBd = () => {
    if (
      userRegex.test(userData) &&
      emailRegex.test(userMail) &&
      passwordRegex.test(password) &&
      confrimPassword === password
    ) {
      localStorage.setItem("userId", userId);
      set(reference, {
        username: userData,
        email: userMail,
        password: password,
        notification: { invitation: "", update: "" },
        invitationCode: invitationCode,
        privilege: 'User',
        userIcon:
          "https://static-00.iconduck.com/assets.00/user-icon-2048x2048-ihoxz4vq.png",
      });
      console.log("User add succes", userData, "UserID =", userId);
      onCancel();
    }
  };

  // Validators

  const isValidateUserName = async (rule, value) => {
    return new Promise((resolve, reject) => {
      // Выполнить асинхронную проверку и вызвать resolve или reject в зависимости от результата
      if (!value) {
        reject("Please input your data!");
      } else if (!userRegex.test(value)) {
        reject("Please input a valid name, ex: Dean Winchester");
      } else {
        resolve();
      }
    });
  };

  const isValidateEmail = async (rule, value) => {
    return new Promise((resolve, reject) => {
      // Выполнить асинхронную проверку и вызвать resolve или reject в зависимости от результата
      if (!value) {
        reject("Please input your mail!");
      } else if (!emailRegex.test(value)) {
        reject("Please input a valid email, ex: test@gmail.com!");
      } else {
        resolve();
      }
    });
  };

  // for validate of password

  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  // confrim password

  const confirmPasswordValidetor = (rule, value) => {
    return new Promise((resolve, reject) => {
      // Выполнить асинхронную проверку и вызвать resolve или reject в зависимости от результата
      if (!value) {
        reject("Confirm your password!");
      } else if (confrimPassword !== password) {
        reject("Incorrect password");
      } else {
        resolve();
      }
    });
  };

  return (
    <Modal
      title={"Registration"}
      open={visible}
      onCancel={onCancel}
      onOk={addUsersToBd}
    >
      <Form
        name="registration-form"
        labelCol={{
          span: 100,
        }}
        wrapperCol={{
          span: 100,
        }}
        style={{
          maxWidth: 1000,
        }}
        onFinish={addUsersToBd}
        autoComplete="off"
        className="registration-form"
      >
        <Form.Item
          className="registration-form-input"
          label="Please input your name and second name"
          name="username"
          validateTrigger="onBlur"
          style={{ height: "90px", marginBottom: "0px" }}
          rules={[
            {
              required: true,
              validator: isValidateUserName,
            },
          ]}
        >
          <Input
            addonBefore={<UserOutlined />}
            placeholder="Your data"
            onChange={(e) => setUserData(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          className="registration-form-input"
          label="Please input your mail"
          name={["user", "email"]}
          validateTrigger="onChange"
          style={{ height: "90px", marginBottom: "0px" }}
          rules={[
            {
              type: "email",
              required: true,
              validator: isValidateEmail,
            },
          ]}
        >
          <Input
            addonBefore={<MailOutlined />}
            placeholder="Your mail"
            onChange={(e) => setUserMail(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          className="registration-form-input"
          label="Please create your password"
          name="password"
          style={
            !passwordRegex.test(password) && password.length
              ? { height: "150px", marginBottom: "0px" }
              : { height: "85px", marginBottom: "0px" }
          }
          rules={[
            {
              required: true,
            },
          ]}
        >
          <div>
            <Input.Password
              addonBefore={<KeyOutlined />}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {!passwordRegex.test(password) && password.length ? (
              <div>
                <p
                  style={
                    password.length < 6 ? { color: "red" } : { color: "green" }
                  }
                >
                  <span>{password.length < 6 ? "Х" : "✓"}</span> The password
                  sould be more then 5 sybols!
                </p>
                <p
                  style={!hasUpperCase ? { color: "red" } : { color: "green" }}
                >
                  <span>{!hasUpperCase ? "Х" : "✓"}</span> The password sould
                  has an upper letter!
                </p>
                <p style={!hasDigit ? { color: "red" } : { color: "green" }}>
                  <span>{!hasDigit ? "Х" : "✓"}</span> The password sould has an
                  upper letter and one number!
                </p>
              </div>
            ) : (
              ""
            )}
          </div>
        </Form.Item>
        {passwordRegex.test(password) && (
          <Form.Item
            className="registration-form-input"
            label="Please confirm the password"
            name="confirm-password"
            style={{ height: "90px", marginBottom: "0px" }}
            rules={[
              {
                required: true,
                validator: confirmPasswordValidetor,
              },
            ]}
          >
            <Input.Password
              addonBefore={<KeyOutlined />}
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default RegistrationModal;
