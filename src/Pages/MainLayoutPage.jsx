import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Chat from "../Components/Chat";
import Header from "../Components/Header";
import Loading from "../Components/Loading";
import { Form, message } from "antd";

// Pictures

import join from "../Icons/join.jpg";
import create from "../Icons/еу.png";
import CreateQuiz from "../Components/CreateQuiz";
import { off, onValue, ref, set, update } from "firebase/database";
import { db } from "../DataBase/firebase";
import PieChart from "../Components/PieChart";

const MainLayoutPage = () => {
  // Styles
  const styles = {
    quizData: {
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
    },
    answersBlock: {
      width: "80%",
      height: "90%",
      padding: "2rem",
      display: "block",
    },
    choosedAnswerBox: {
      maxWidth: "30%",
      padding: "1rem",
      border: "2px solid #fff",
      borderRadius: "15px",
    },
    question: {
      display: "flex",
      justifyContent: "space-between",
    },
    wrongAnswer: {
      width: "100%",
      padding: "1rem",
      border: "1px solid #fff",
      borderRadius: "15px",
      background: "red",
      marginTop: "20px",
      color: "#fff",
    },
    rightAnswer: {
      width: "100%",
      padding: "1rem",
      border: "1px solid #fff",
      borderRadius: "15px",
      background: "green",
      marginTop: "20px",
      color: "#fff",
    },
    statisticsBlock: {
      display: "block",
      width: "350px",
      height: "475px",
      overflowY: "auto",
      borderLeft: "2px solid white",
      borderTop: "2px solid white",
      padding: "0 0px 20px 20px",
    },
  };

  // get  Main Data of users and find

  const users = useSelector((state) => state.data.users);
  const rooms = useSelector((state) => state.roomsData.rooms);

  const getUserId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const userData = users.find((user) => user.id === getUserId);

  // new room data

  const [newRoomData, setNewRoomData] = useState(
    userData ? userData.roomId : null
  );

  const [participantsArray, setParticipantsArray] = useState([]);
  const [requestsArray, setRequestsArray] = useState([]);
  const [isHover, setIsHover] = useState(null);

  const roomData = rooms.find((room) => room.creatorId === getUserId);
  const quizData = rooms.find((room) => room.roomId === newRoomData);

  // create Quiz
  const [isCreateQuiz, setIsCreateQuiz] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isStartedQuiz, setIsStartedQuiz] = useState(false);
  const [isFinishQuiz, setIsFinishQuiz] = useState(false);
  const [isFinishedParticipantsArray, setIsFinishedParticipantsArray] =
    useState([]); // the state is for map all of the participants data and make a statistics
  const [isFinishedParticipantsData, setIsFinishedParticipantsData] =
    useState(null);
  const [checkParticipantsFinishedData, setCheckParticipantsFinishedData] =
    useState(null);

  console.log(isFinishedParticipantsData, checkParticipantsFinishedData);

  const hancleCloseQuizCreator = () => {
    setIsCreateQuiz(false);
  };

  const createQuizRoom = () => {
    if (userData.privilege === "Moderator") {
      setIsCreateQuiz(true);
    } else {
      messageApi.open({
        type: "error",
        content: "You don`t have the privilege!",
      });
    }
  };
  // for control and render the component if some data was update

  useEffect(() => {
    // if users data had a change then just render the component

    const usersRef = ref(db, `users/${getUserId}`);

    const handelUpdateData = (snapshot) => {
      const newRoom = snapshot.val();

      if (newRoom) {
        setNewRoomData(newRoom.roomId);
      }
    };

    onValue(usersRef, handelUpdateData);

    return () => {
      off(usersRef, "value", handelUpdateData);
    };
  }, [getUserId]);

  useEffect(() => {
    // requests and participants

    if (quizData) {
      const participantsRef = ref(db, `rooms/${userData.roomId}/participants`);

      const handleParticipantsData = (snapshot) => {
        const participants = snapshot.val();
        if (participants) {
          const keys = Object.keys(participants);
          const participantsArray = keys.map((key) => ({
            id: key,
            ...participants[key],
          }));
          setParticipantsArray(participantsArray);
        }
      };

      // for control participants who finished the quiz

      const pointsObjRef = ref(
        db,
        `rooms/${userData.roomId}/participantPoint/`
      );

      // const pointsObj = quizData.participantPoint.find();
      const handleParticipantsPoint = (snapshot) => {
        const points = snapshot.val();
        if (points) {
          const pointsObjKey = Object.keys(points);
          const findUser = pointsObjKey.map((key) => ({
            id: key,
            ...points[key],
          }));

          const foundUserData = findUser.find(
            (data) => data.id === userData.id
          );

          console.log(findUser);
          setIsFinishQuiz(true);
          setIsFinishedParticipantsArray(findUser);
          setIsFinishedParticipantsData(foundUserData);
        } else {
          setIsFinishedParticipantsArray([]);
          setIsFinishedParticipantsData(null);
          setIsFinishQuiz(false);
        }
      };
      const requestRef = ref(db, `rooms/${roomData?.id}/requests`);

      const handleRequestsData = (snapshot) => {
        const requests = snapshot.val();

        if (requests) {
          const keys = Object.keys(requests);
          const requestsArray = keys.map((key) => ({
            id: key,
            ...requests[key],
          }));
          setRequestsArray(requestsArray);
        } else {
          setRequestsArray([]);
        }
      };

      // automaticle have start quiz when all of participants are ready

      const quizRef = ref(db, `rooms/${userData.roomId}/`);

      const handleStartQuiz = async () => {
        if (requestsArray.length <= 0) {
          try {
            await update(quizRef, { isStarted: true });
            setIsStartedQuiz(true);
          } catch (error) {
            console.error(error);
          }
        }
      };

      onValue(pointsObjRef, handleParticipantsPoint);
      onValue(participantsRef, handleParticipantsData);
      onValue(requestRef, handleRequestsData);
      onValue(quizRef, handleStartQuiz);

      return () => {
        off(participantsRef, "value", handleParticipantsData);
        off(pointsObjRef, "value", handleParticipantsPoint);
        off(requestRef, "value", handleRequestsData);
        off(quizRef, "value", handleStartQuiz);
      };
    }
  }, [quizData, requestsArray.length, roomData, userData]);

  const isParicipantsHover = (participantsId) => {
    setIsHover(participantsId);
  };

  const handleStartQuiz = async () => {
    const quizRef = ref(db, `rooms/${userData.roomId}/`);
    try {
      await update(quizRef, { isStarted: true });
    } catch (error) {
      console.error(error);
    }
  };

  // next - back btn

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const [activeAnswer, setActiveAnswer] = useState(null);
  const questionLength = quizData?.questions.length;

  // console.log(quizData.questions[questionIndex].questionInput);

  const selectAnswer = (answerIndex) => {
    if (activeAnswer === answerIndex) {
      setActiveAnswer(null);
    } else {
      setActiveAnswer(answerIndex);
    }
    setSelectedAnswer(answerIndex);
    console.log(answerIndex, selectedAnswer, activeAnswer);
  };

  const handleNextButton = () => {
    if (questionIndex === questionLength) {
      setSelectedAnswer(...selectedAnswer);
    }
    setQuestionIndex(questionIndex + 1);
  };

  const handleBackButton = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleFinishButton = () => {
    let currentPoints = 0;
    const participantPoint = ref(
      db,
      `rooms/${userData.roomId}/participantPoint/` + userData.id
    );
    try {
      quizData.questions.forEach(async (question) => {
        // Проверяем, если выбранный ответ совпадает с правильным ответом
        if (selectedAnswer === question.selectedAnswer) {
          currentPoints++; // Увеличиваем счётчик баллов
        }
        await set(participantPoint, {
          participantIcon: userData.userIcon,
          participantName: userData.username,
          point: currentPoints,
          choosedAnswer: selectedAnswer,
          // wrongAnswers:
        });
      });
    } catch (error) {
      alert(error);
    }
  };

  // for conrol information about participants data after finished quiz

  const [openRequest, setOpenRequest] = useState(true);
  const [openStatistics, setOpenStatistics] = useState(false);

  const handleFinishedParticipandsData = (participantId) => {
    setCheckParticipantsFinishedData(quizData.participantPoint[participantId]);
  };

  const handleOpenRequest = () => {
    setOpenStatistics(false);
    setOpenRequest(true);
  };

  const handleOpenStatistic = () => {
    setOpenRequest(false);
    setOpenStatistics(true);
  };

  return !users.length ? (
    <Loading />
  ) : (
    <div className="main-layout">
      <header>
        <Header
          userData={userData}
          getId={getUserId}
          isCreateQuiz={isCreateQuiz}
        />
      </header>
      {contextHolder}
      {isCreateQuiz && !newRoomData ? (
        <CreateQuiz
          visible={isCreateQuiz}
          users={users}
          onClose={hancleCloseQuizCreator}
          userData={userData}
        />
      ) : (
        <div className="container-layout">
          {userData && userData.privilege !== "Admin" ? (
            <>
              {quizData ? (
                <div className="quiz-container">
                  {userData && userData.privilege === "Moderator" ? (
                    <div className="quiz-moderator-container">
                      <div className="quiz-container-header">
                        {participantsArray.map((participant) => (
                          <div
                            key={participant.id}
                            className="participants-data"
                            onMouseEnter={() =>
                              isParicipantsHover(participant.id)
                            }
                            onMouseLeave={() => setIsHover(null)}
                          >
                            <div
                              className="participants-icon-block"
                              onClick={() =>
                                handleFinishedParticipandsData(participant.id)
                              }
                            >
                              <img
                                src={participant.participantsIcon}
                                alt="participants-icon"
                              />
                            </div>
                            <div
                              className={`participants-name ${
                                isHover === participant.id ? "show-name" : ""
                              }`}
                            >
                              {participant.participantsName}
                            </div>
                          </div>
                        ))}
                      </div>
                      {!isStartedQuiz ? (
                        <div className="quiz-container-blocks">
                          <div className="quiz-container-left-side">
                            <Form>
                              <Form.Item>
                                <h2
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  Requests
                                </h2>

                                <div className="participant-container">
                                  {requestsArray.length > 0 ? (
                                    <>
                                      {requestsArray.map((participant) => (
                                        <div
                                          key={participant.id}
                                          className="participant-container-block"
                                        >
                                          {!participant.acceptRequest ? (
                                            <div className="participant-data">
                                              <div className="participant-icon-block">
                                                <img
                                                  src={
                                                    participant.participantsIcon
                                                  }
                                                  alt="participant-icon"
                                                />
                                              </div>
                                              <span>
                                                {participant.participantsName}
                                              </span>
                                              <div className="request-user-block">
                                                {participant.acceptRequest ===
                                                undefined ? (
                                                  <span className="material-symbols-outlined">
                                                    schedule
                                                  </span>
                                                ) : (
                                                  <span
                                                    style={{ color: "#3f0202" }}
                                                    className="material-symbols-outlined"
                                                  >
                                                    person_cancel
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            ""
                                          )}
                                        </div>
                                      ))}
                                    </>
                                  ) : (
                                    <span
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: "100%",
                                        height: "100%",
                                        fontSize: "20px",
                                        color: "orange",
                                        borderTop: "2px solid white",
                                      }}
                                    >
                                      Every participants accepted request!
                                    </span>
                                  )}
                                </div>
                              </Form.Item>
                            </Form>
                          </div>
                          <div className="quiz-container-right-side">
                            <div className="quiz-container-right-side-header">
                              <h1>
                                Count of ready partiscipants:{" "}
                                {participantsArray.length}/
                                {requestsArray.length +
                                  participantsArray.length}
                              </h1>
                            </div>
                            <div className="info-text">
                              <span>
                                The quiz will begin when all participants are
                                ready, If you wanna start quiz immediately,
                                click on the button below
                              </span>
                            </div>
                            <div className="quiz-container-right-side-start-btn">
                              <button
                                onClick={handleStartQuiz}
                                className="start-btn"
                              >
                                Start
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="quiz-container-blocks">
                          <div
                            className="quiz-container-left-side"
                            style={{
                              display: "flex",
                              width: "31%",
                              padding: "0 20px 0 20px",
                            }}
                          >
                            <div className="setting-icons">
                              <div
                                className="requests"
                                onClick={handleOpenRequest}
                              >
                                <span
                                  id="requests"
                                  className={`material-symbols-outlined ${
                                    openRequest ? "active" : ""
                                  }`}
                                >
                                  public
                                </span>
                              </div>
                              <div
                                className="statistics"
                                onClick={handleOpenStatistic}
                              >
                                <span
                                  id="statistics"
                                  className={`material-symbols-outlined ${
                                    openStatistics ? "active" : ""
                                  }`}
                                >
                                  monitoring
                                </span>
                              </div>
                            </div>
                            {openRequest && (
                              <Form>
                                <Form.Item>
                                  <h2
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    Requests
                                  </h2>

                                  <div className="participant-container">
                                    {requestsArray.length > 0 ? (
                                      <>
                                        {requestsArray.map((participant) => (
                                          <div
                                            key={participant.id}
                                            className="participant-container-block"
                                          >
                                            {!participant.acceptRequest ? (
                                              <div className="participant-data">
                                                <div className="participant-icon-block">
                                                  <img
                                                    src={
                                                      participant.participantsIcon
                                                    }
                                                    alt="participant-icon"
                                                  />
                                                </div>
                                                <span>
                                                  {participant.participantsName}
                                                </span>
                                                <div className="request-user-block">
                                                  {participant.acceptRequest ===
                                                  undefined ? (
                                                    <span className="material-symbols-outlined">
                                                      schedule
                                                    </span>
                                                  ) : (
                                                    <span
                                                      style={{
                                                        color: "#3f0202",
                                                      }}
                                                      className="material-symbols-outlined"
                                                    >
                                                      person_cancel
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            ) : (
                                              ""
                                            )}
                                          </div>
                                        ))}
                                      </>
                                    ) : (
                                      <span
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          width: "100%",
                                          height: "100%",
                                          fontSize: "20px",
                                          color: "orange",
                                          borderTop: "2px solid white",
                                        }}
                                      >
                                        Every participants accepted request!
                                      </span>
                                    )}
                                  </div>
                                </Form.Item>
                              </Form>
                            )}
                            {openStatistics && (
                              <Form>
                                <Form.Item>
                                  <h2
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    Statistics
                                  </h2>

                                  <div
                                    className="statistics-container"
                                    style={styles.statisticsBlock}
                                  >
                                    <div
                                      className="pie-chart"
                                      style={{ width: "80%" }}
                                    >
                                      <PieChart
                                        participants={
                                          isFinishedParticipantsArray
                                        }
                                        questionsQuizLength={
                                          quizData.questions.length
                                        }
                                      />
                                    </div>
                                  </div>
                                </Form.Item>
                              </Form>
                            )}
                          </div>
                          {checkParticipantsFinishedData ? (
                            <div className="quiz-container-right-side">
                              <div className="quiz-container-right-side-header">
                                <div
                                  className="header-i"
                                  style={{ display: "block" }}
                                >
                                  <h1>
                                    {
                                      checkParticipantsFinishedData.participantName
                                    }
                                  </h1>
                                  <h2
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      color: "orange",
                                    }}
                                  >
                                    Score: {checkParticipantsFinishedData.point}
                                    /{quizData.questions.length}
                                  </h2>
                                </div>
                              </div>
                              <div
                                className="quiz-data"
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  height: "100%",
                                }}
                              >
                                {quizData.questions.map((question, index) => (
                                  <div
                                    key={question.id}
                                    className="answers-block"
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      height: "90%",
                                      padding: "2rem",
                                    }}
                                  >
                                    <div
                                      style={styles.choosedAnswerBox}
                                      className="choosed-answer-box"
                                    >
                                      <div
                                        className="question"
                                        style={styles.question}
                                      >
                                        <h3>
                                          {index + 1}. {question.questionInput}
                                        </h3>
                                        <span>
                                          {question.answers[
                                            checkParticipantsFinishedData
                                              .choosedAnswer
                                          ] ===
                                          question.answers[
                                            question.selectedAnswer
                                          ] ? (
                                            <span style={{ color: "#00fa53" }}>
                                              +1
                                            </span>
                                          ) : (
                                            <span style={{ color: "red" }}>
                                              0
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      <div
                                        className="choosed-answer"
                                        style={
                                          question.answers[
                                            checkParticipantsFinishedData
                                              .choosedAnswer
                                          ] ===
                                          question.answers[
                                            question.selectedAnswer
                                          ]
                                            ? styles.rightAnswer
                                            : styles.wrongAnswer
                                        }
                                      >
                                        {
                                          question.answers[
                                            checkParticipantsFinishedData
                                              .choosedAnswer
                                          ]
                                        }
                                      </div>
                                      <div
                                        className="right-answer"
                                        style={styles.rightAnswer}
                                      >
                                        {
                                          question.answers[
                                            question.selectedAnswer
                                          ]
                                        }
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="quiz-container-right-side-start-btn"></div>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {!isFinishQuiz ? (
                        <div className="quiz-user-container">
                          <div className="quiz-container-header">
                            {participantsArray.map((participant) => (
                              <div
                                key={participant.id}
                                className="participants-data"
                                onMouseEnter={() =>
                                  isParicipantsHover(participant.id)
                                }
                                onMouseLeave={() => setIsHover(null)}
                              >
                                <div className="participants-icon-block">
                                  <img
                                    src={participant.participantsIcon}
                                    alt="participants-icon"
                                  />
                                </div>
                                <div
                                  className={`participants-name ${
                                    isHover === participant.id
                                      ? "show-name"
                                      : ""
                                  }`}
                                >
                                  {participant.participantsName}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="quiz-container-blocks">
                            {!isStartedQuiz ? (
                              <div className="quiz-info">
                                <div className="quiz-info-header">
                                  <h1>
                                    Count of ready partiscipants:{" "}
                                    <span style={{ color: "red" }}>
                                      {participantsArray.length}
                                    </span>
                                    /
                                    <span style={{ color: "#3fdf06" }}>
                                      {requestsArray.length +
                                        participantsArray.length}
                                    </span>
                                  </h1>
                                </div>
                                <div className="info-text">
                                  <span>
                                    The quiz will begin when all participants
                                    are ready, however you already able to use
                                    the chat with partiscipants
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="quiz">
                                <div className="quiz-block-parts-header">
                                  <div className="question">
                                    {
                                      quizData.questions[questionIndex]
                                        .questionInput
                                    }
                                  </div>
                                  <span>
                                    {questionIndex}/{quizData.questions.length}
                                  </span>
                                </div>
                                <div className="quiz-block-parts">
                                  <div className="quiz-block-left-part">
                                    <div className="quiz-block-left-part-picture">
                                      <img
                                        src={
                                          quizData.questions[questionIndex]
                                            .isSelectedPicture
                                        }
                                        alt="question-pictures"
                                      />
                                    </div>
                                  </div>
                                  <div className="quiz-block-right-part">
                                    <div className="quiz-block-right-part-answers">
                                      {quizData.questions[
                                        questionIndex
                                      ].answers.map((answer, index) => (
                                        <span
                                          key={index}
                                          id="answer"
                                          className={`${
                                            activeAnswer === index
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() => selectAnswer(index)}
                                        >
                                          {answer}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="quiz-block-right-part-buttons">
                                      <button
                                        className="quiz-block-right-part-button-back"
                                        onClick={handleBackButton}
                                      >
                                        Back
                                      </button>
                                      {questionIndex + 1 !==
                                      quizData.questions.length ? (
                                        <button
                                          className="quiz-block-right-part-button-next"
                                          onClick={handleNextButton}
                                        >
                                          Next
                                        </button>
                                      ) : (
                                        <button
                                          style={{ background: "red" }}
                                          className="quiz-block-right-part-button-next"
                                          onClick={handleFinishButton}
                                        >
                                          Finish
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="quiz-user-container">
                          <div className="quiz-container-header">
                            {participantsArray.map((participant) => (
                              <div
                                key={participant.id}
                                className="participants-data"
                                onMouseEnter={() =>
                                  isParicipantsHover(participant.id)
                                }
                                onMouseLeave={() => setIsHover(null)}
                              >
                                <div className="participants-icon-block">
                                  <img
                                    src={participant.participantsIcon}
                                    alt="participants-icon"
                                  />
                                </div>
                                <div
                                  className={`participants-name ${
                                    isHover === participant.id
                                      ? "show-name"
                                      : ""
                                  }`}
                                >
                                  {participant.participantsName}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="quiz-container-blocks">
                            <div className="quiz">
                              <div className="quiz-block-parts-header">
                                <div className="question">
                                  <h1>
                                    Score {isFinishedParticipantsData.point}/
                                    {quizData.questions.length}
                                  </h1>
                                </div>
                              </div>
                              <div
                                className="quiz-data"
                                style={styles.quizData}
                              >
                                {quizData.questions.map((question, index) => (
                                  <div
                                    key={question.id}
                                    className="answers-block"
                                    style={styles.answersBlock}
                                  >
                                    <div
                                      style={styles.choosedAnswerBox}
                                      className="choosed-answer-box"
                                    >
                                      <div
                                        className="question"
                                        style={styles.question}
                                      >
                                        <h3>
                                          {index + 1}. {question.questionInput}
                                        </h3>
                                        <span>
                                          {question.answers[
                                            isFinishedParticipantsData
                                              .choosedAnswer
                                          ] ===
                                          question.answers[
                                            question.selectedAnswer
                                          ] ? (
                                            <span style={{ color: "#00fa53" }}>
                                              +1
                                            </span>
                                          ) : (
                                            <span style={{ color: "red" }}>
                                              0
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      <div
                                        className="choosed-answer"
                                        style={
                                          question.answers[
                                            isFinishedParticipantsData
                                              .choosedAnswer
                                          ] ===
                                          question.answers[
                                            question.selectedAnswer
                                          ]
                                            ? styles.rightAnswer
                                            : styles.wrongAnswer
                                        }
                                      >
                                        {
                                          question.answers[
                                            isFinishedParticipantsData
                                              .choosedAnswer
                                          ]
                                        }
                                      </div>
                                      <div
                                        className="right-answer"
                                        style={styles.rightAnswer}
                                      >
                                        {
                                          question.answers[
                                            question.selectedAnswer
                                          ]
                                        }
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="card-container">
                  <div
                    className="card create-meet-card"
                    onClick={createQuizRoom}
                  >
                    <div className="create-meet-header">
                      <p className="meet-header-text">Create a quiz</p>
                      <div className="create-second-text-part">
                        <p className="meet-header-text">Create a quiz</p>
                      </div>
                    </div>
                    <img
                      className="create-meet-img"
                      src={create}
                      alt="create"
                    ></img>
                  </div>
                  <div className="card join-meet-card">
                    <div className="join-meet-header">
                      <h3 className="join">Join</h3>
                      <h3 className="to">to</h3>
                      <h3 className="meet">Quiz</h3>
                      <div className="join-second-text-part">
                        <h3 className="join">Join</h3>
                        <h3 className="to">to</h3>
                        <h3 className="meet">Quiz</h3>
                      </div>
                    </div>
                    <img className="join-meet-img" src={join} alt="join"></img>
                  </div>

                  <div id="cardsModal" className="modal">
                    <div className="modal-content">
                      <span className="close">&times;</span>
                      <h2 className="header-modal">Create a Meet</h2>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            "Something satting fro admin"
          )}
        </div>
      )}
      <Chat
        userData={userData}
        usersData={users}
        id={getUserId}
        roomData={quizData}
        rooms={rooms}
        participants={participantsArray}
      />
    </div>
  );
};

export default MainLayoutPage;
