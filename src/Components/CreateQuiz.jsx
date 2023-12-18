import { PlusOutlined } from "@ant-design/icons";
import { Form, Input, message } from "antd";
import { ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { db } from "../DataBase/firebase";
import SelectedPicturesModal from "../Modal/SelectedPicturesModal";
import AnswerInput from "./AnswerInput";

const CreateQuiz = ({ visible, users, onClose, userData }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const [addUsers, setAddUsers] = useState("");
  const [participantsArray, setParticipantsArray] = useState([]);

  // quiz data
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionInput, setQuestionInput] = useState("");

  const [selectPicture, setSelectPicture] = useState(false);
  const [isSelectedPicture, setIsSelectedPicture] = useState("");

  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, ""]);
    } else {
      messageApi.open({
        type: "warning",
        content: "You get max length!",
      });
    }
  };

  const handlePictureChange = (newPicture) => {
    setIsSelectedPicture(newPicture);
  };

  const closeSelectPictureModal = () => {
    setSelectPicture(false);
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleRemoveAnswer = (indexToRemove) => {
    const updatedAnswers = answers.filter(
      (_, index) => index !== indexToRemove
    );
    setAnswers(updatedAnswers);
  };

  const handleNextButton = () => {
    if (questionIndex === questions.length) {
      setQuestions([
        ...questions,
        { questionInput, answers, selectedAnswer, isSelectedPicture },
      ]);
      setQuestionInput("");
      setAnswers([]);
      setIsSelectedPicture("");
      setSelectedAnswer(null);
    }
    setQuestionIndex(questionIndex + 1);
  };

  const handleBackButton = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  console.log(questions, questionIndex);

  // fn for find a user

  const findUserByInvitationCode = +addUsers;

  const findUsers = users.find(
    (user) =>
      user.username === addUsers ||
      user.email === addUsers ||
      user.id === addUsers ||
      user.invitationCode === findUserByInvitationCode
  );

  useEffect(() => {
    const handleEnterClick = (event) => {
      if (event.key === "Enter") {
        if (findUsers) {
          try {
            if (!participantsArray.some((users) => users.id === findUsers.id)) {
              setParticipantsArray([...participantsArray, findUsers]);
              messageApi.open({
                type: "success",
                content: "Add successful",
              });
            } else {
              messageApi.open({
                type: "warning",
                content: "You already add the user!",
              });
            }
          } catch (error) {
            console.error("Something wrong", error);
          }
        } else {
          messageApi.open({
            type: "error",
            content: "User not found!",
          });
        }
        setAddUsers("");
      }
    };

    document.addEventListener("keydown", handleEnterClick);

    return () => {
      document.removeEventListener("keydown", handleEnterClick);
    };
  }, [findUsers, messageApi, participantsArray]);

  const handleFindUsers = async () => {
    if (findUsers) {
      try {
        if (!participantsArray.some((users) => users.id === findUsers.id)) {
          setParticipantsArray([...participantsArray, findUsers]);
          messageApi.open({
            type: "success",
            content: "Add successful",
          });
        } else {
          messageApi.open({
            type: "warining",
            content: "You already add the user!",
          });
        }
      } catch (error) {
        console.error("Something wrong", error);
      }
    } else {
      messageApi.open({
        type: "error",
        content: "User not found!",
      });
    }
    setAddUsers("");
  };

  const removeParticipant = (participantId) => {
    const updatedParticipants = participantsArray.filter(
      (participant) => participant.id !== participantId
    );
    setParticipantsArray(updatedParticipants);
    console.log(updatedParticipants);
  };

  const createQuizRoom = async () => {
    const randomKey = Math.random().toString(36).substring(2) + Date.now();
    const randomRoomId = Math.random().toString(5).substring(20) + Date.now();
    try {
      await Promise.all(
        participantsArray.map(async (participant) => {
          const getUsersPath = ref(
            db,
            `users/${participant.id}/notification/invitation/` + randomKey
          );

          await set(getUsersPath, {
            userIcon: userData.userIcon,
            username: userData.username,
            userId: userData.id,
            message: "Invitation to a quiz!",
            friendsRequest: false,
            quizRequest: true,
            roomId: randomRoomId,
          });
        })
      );

      const createRoom = ref(db, `rooms/` + randomRoomId);

      await set(createRoom, {
        userIcon: userData.userIcon,
        username: userData.username,
        questions: questions,
        participants: {},
        friendsRequest: false,
        quizRequest: true,
        roomId: randomRoomId,
      });

      messageApi.open({
        type: "success",
        content: "Invitations sent successfully",
      });
    } catch (error) {
      console.error("Something went wrong with sending invitations", error);
    }
  };

  return visible ? (
    <div className="create-quiz-container">
      {contextHolder}
      <div className="create-quiz-header">
        <div className="close-create-quiz-container" onClick={onClose}>
          <span>
            <b>x</b>
          </span>
        </div>
      </div>
      <div className="create-quiz-container-blocks">
        <div className="create-quiz-container-left-side">
          <Form>
            <Form.Item>
              <h2 style={{ display: "flex", justifyContent: "center" }}>
                Add users to quiz
              </h2>
              <Input
                addonAfter={
                  <PlusOutlined
                    onClick={handleFindUsers}
                    style={{
                      cursor: "pointer",
                      fontSize: "20px",
                      color: "#3df804",
                    }}
                  />
                }
                value={addUsers}
                placeholder="Try to find someone"
                onChange={(e) => setAddUsers(e.target.value)}
              />
              <div className="participant-container">
                {participantsArray.map((participant) => (
                  <div
                    key={participant.id}
                    className="participant-container-block"
                  >
                    <div className="participant-data">
                      <div className="participant-icon-block">
                        <img
                          src={participant.userIcon}
                          alt="participant-icon"
                        />
                      </div>
                      <span>{participant.username}</span>
                      <div
                        className="remove-user-block"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "#fff" }}
                        >
                          close
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Form.Item>
          </Form>
        </div>
        <div className="create-quiz-container-right-side">
          <div className="create-quiz-container-block">
            <h2 style={{ display: "flex", justifyContent: "center" }}>Quiz</h2>
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              {questionIndex}/{questions.length}
            </span>
            <div className="create-quiz-container-header">
              <div className="create-quiz-block-questions">
                {questionIndex !== questions.length ? (
                  <input
                    type="text"
                    value={questions[questionIndex].questionInput}
                    placeholder="Type your question right here"
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[questionIndex].questionInput =
                        e.target.value;
                      setQuestions(updatedQuestions);
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={questionInput}
                    placeholder="Type your question right here"
                    onChange={(e) => setQuestionInput(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="create-quiz-block-parts">
              <div className="create-quiz-block-left-part">
                <div className="create-quiz-block-left-part-picture">
                  {questionIndex !== questions.length ? (
                    <div
                      className="link-to-picture-block"
                      onClick={() => setSelectPicture(true)}
                    >
                      <div>
                        <img
                          src={questions[questionIndex]?.isSelectedPicture}
                          alt="question-pictures"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="link-to-picture-block"
                      onClick={() => setSelectPicture(true)}
                    >
                      {isSelectedPicture ? (
                        <div>
                          <img
                            src={isSelectedPicture}
                            alt="question-pictures"
                          />
                        </div>
                      ) : (
                        <span className="material-symbols-outlined">
                          photo_camera_back
                        </span>
                      )}
                    </div>
                  )}
                  <SelectedPicturesModal
                    visible={selectPicture}
                    onClose={closeSelectPictureModal}
                    onPictureChange={handlePictureChange}
                  />
                </div>
                <div className="create-quiz-button">
                  <button onClick={createQuizRoom} id="create-quiz">
                    Create Quiz
                  </button>
                </div>
              </div>
              <div className="create-quiz-block-right-part">
                {questionIndex !== questions.length ? (
                  <div className="create-quiz-block-right-part-answers">
                    {questions[questionIndex]?.answers.map((answer, index) => (
                      <AnswerInput
                        key={index}
                        value={answer}
                        removeAnswer={() => handleRemoveAnswer(index)}
                        selectAnswer={() => setSelectedAnswer(index)}
                        onChange={(e) =>
                          handleAnswerChange(index, e.target.value)
                        }
                      />
                    ))}
                    <div className="add-answer-btn" onClick={addAnswer}>
                      <span
                        style={{ color: "blue" }}
                        className="material-symbols-outlined"
                      >
                        add
                      </span>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "17px",
                          fontWeight: "bold",
                        }}
                      >
                        Add answer
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="create-quiz-block-right-part-answers">
                    {answers.map((answer, index) => (
                      <AnswerInput
                        key={index}
                        value={answer}
                        removeAnswer={() => handleRemoveAnswer(index)}
                        selectAnswer={() => setSelectedAnswer(index)}
                        onChange={(e) =>
                          handleAnswerChange(index, e.target.value)
                        }
                      />
                    ))}
                    <div className="add-answer-btn" onClick={addAnswer}>
                      <span
                        style={{ color: "blue" }}
                        className="material-symbols-outlined"
                      >
                        add
                      </span>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "17px",
                          fontWeight: "bold",
                        }}
                      >
                        Add answer
                      </span>
                    </div>
                  </div>
                )}
                {questionIndex !== questions.length ? (
                  <div className="create-quiz-block-right-part-right-answer">
                    Right Answer:{" "}
                    {
                      questions[questionIndex].answers[
                        questions[questionIndex].selectedAnswer
                      ]
                    }
                  </div>
                ) : (
                  <div className="create-quiz-block-right-part-right-answer">
                    Right Answer: {answers[selectedAnswer]}
                  </div>
                )}
                <div className="create-quiz-block-right-part-buttons">
                  <button
                    className="create-quiz-block-right-part-button-back"
                    onClick={handleBackButton}
                  >
                    Back
                  </button>
                  <button
                    className="create-quiz-block-right-part-button-next"
                    onClick={handleNextButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};

export default CreateQuiz;
