import React, { useState, useEffect } from "react";
import { Checkbox, Form, Input, message } from "antd";
import { KeyOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../Hooks/useAuth";
import Loading from "../Components/Loading";
import RegistrationModal from "../Modal/RegistrationModal";
import { auth, db } from "../DataBase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { off, onValue, ref, set } from "firebase/database";
import { fetchUsers } from "../ReduxStore/reducers/reduxSaga/userReducer";

const AuthorizationPage = () => {
  const [userMail, setUserMail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemember, setIsRemember] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const navigate = useNavigate();

  // get users from DB + SAGA
  const dispatch = useDispatch();
  const users = useSelector((state) => state.data.users);

  // for auth with a google acc

  const provider = new GoogleAuthProvider();
  const invitationCode = Math.floor(Math.random().toString(10).substring(8));

  // sign in with Google acc and add to firebase

  const signInWithGoogle = async () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // Sigh in is success, now get info about users from `result.user`
        const user = result.user;
        const reference = ref(db, "users/" + user.uid);
        const usersIdMap = users.find((user) => user.id === user.uid);
        if (usersIdMap === undefined) {
          set(reference, {
            username: user.displayName,
            email: user.email,
            password: "",
            notification: { invitation: "", update: "" },
            invitationCode: invitationCode,
            privilege: "User",
            userIcon: user.photoURL,
          });
        }
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("theme", "dark");

        navigate("/test");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // RegExp for mail

  // if user has userToken then just transfirm to main page

  const isAuthenticated = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/test");
    }

    // for realTime update

    const usersRef = ref(db, `users/`);

    // const handleUsersData = (snapshot) => {
    //   const newUser = snapshot.val();
    //   if (newUser) {
    //     const keys = Object.keys(newUser);
    //     const newUsersArray = keys.map((key) => ({
    //       id: key,
    //       ...newUser[key],
    //     }));
    //     setNewUsers(newUsersArray);
    //   } else {
    //     setNewUsers(users);
    //   }
    // };

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        dispatch(fetchUsers(data));
      }
    });

    return () => {
      off(usersRef, "value");
    };
  }, [navigate, isAuthenticated, dispatch]);

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  // for control input values
  const isValidateEmail = async (rule, value) => {
    return new Promise((resolve, reject) => {
      // requst async and call resolve or reject
      if (!value) {
        reject("Please input your mail!");
      } else if (!emailRegex.test(value)) {
        reject("Please input a valid email, ex: test@gmail.com!");
      } else {
        resolve();
      }
    });
  };

  // get users token who already had registration and check correct mail

  const getUserToken = localStorage.getItem("userId");

  // the function, to recover the password

  const isCorrectMail = () => {
    // get mail from BD

    const mail = users.find((mail) => mail.email === userMail);

    // if mail === mail from BD then return this one belowe if not send a error message

    if (mail) {
      messageApi.open({
        type: "success",
        content: "Check your mail!",
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Incorrect mail!",
      });
    }
  };

  //when form has name + password (correct password* from bd) then call onFinish

  const onFinish = async () => {
    // get users password and email
    const userPassword = await users.find((user) => user.password === password);
    const mail = await users.find((mail) => mail.email === userMail);

    const isLogin = userPassword && mail;

    if (isLogin) {
      checkRemember(isLogin.id);
      messageApi.open({
        type: "success",
        content: "Successful",
      });
      // for navigate to main page
      localStorage.setItem("theme", "dark");
      navigate("/test");
    } else {
      messageApi.open({
        type: "error",
        content: "Login failed!",
      });
    }
  };

  const checkRemember = (id) => {
    if (isRemember) {
      localStorage.setItem("userId", id);
    } else {
      sessionStorage.setItem("userId", id);
      sessionStorage.setItem("theme", "dark");
    }
  };

  // Registration Modal

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
  };

  return users.length <= 0 ? (
    <Loading />
  ) : (
    <div className="authorization-container">
      <div className="container-autorization-block">
        {contextHolder}
        <div className="content-autorization">
          <h1>Authorization</h1>
          <Form
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 25,
            }}
            style={{
              maxWidth: 1000,
              marginTop: 20,
            }}
            initialValues={{
              remember: isRemember,
            }}
            validateTrigger="onBlur"
            onFinish={onFinish}
            autoComplete="off"
            className="authorization-form"
          >
            <Form.Item
              className="authorization-form-input"
              name="mail"
              style={{ height: "65px", margin: "0" }}
              rules={[
                {
                  required: true,
                  validator: isValidateEmail,
                },
              ]}
            >
              <Input
                type="email"
                placeholder={`Mail`}
                id="mail"
                addonBefore={<UserOutlined />}
                style={{ marginBottom: "1vh" }}
                onChange={(e) => setUserMail(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              className="authorization-form-input"
              name="password"
              style={{ height: "55px", margin: "0" }}
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password
                type="text"
                placeholder="Password"
                id="password"
                addonBefore={<KeyOutlined />}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              className="authorization-checkbox"
              name="remember"
              valuePropName="checked"
              wrapperCol={{
                offset: 8,
                span: 16,
              }}
            >
              <Checkbox onChange={(e) => setIsRemember(e.target.checked)}>
                <b>Remember me</b>
              </Checkbox>
            </Form.Item>
            <div className="link-to-registration">
              {!getUserToken ? (
                <span onClick={() => setShowRegistrationModal(true)}>
                  Registration
                </span>
              ) : (
                <span onClick={isCorrectMail}>Forgot password</span>
              )}
            </div>
            <div style={{ marginTop: "5px" }}>
              <p>
                <b onClick={signInWithGoogle} style={{ cursor: "pointer" }}>
                  SIGH IN with a
                  <img
                    className="google-img"
                    src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png"
                    alt="google"
                  />
                </b>
              </p>
            </div>
            <button
              data-testid="login-button"
              style={{ marginTop: "2vh", width: "100%" }}
              name="Login"
              id="login"
            >
              Login
            </button>
          </Form>
        </div>
        <RegistrationModal
          visible={showRegistrationModal}
          onCancel={closeRegistrationModal}
        />
      </div>
    </div>
  );
};

export default AuthorizationPage;
