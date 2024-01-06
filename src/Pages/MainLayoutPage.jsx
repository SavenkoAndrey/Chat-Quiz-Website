import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Chat from "../Components/Chat";
import Header from "../Components/Header";
import Loading from "../Components/Loading";
import { message } from "antd";

// Pictures

import join from "../Icons/join.jpg";
import create from "../Icons/еу.png";
import CreateQuiz from "../Components/CreateQuiz";
import { off, onValue, ref, set, update } from "firebase/database";
import { db } from "../DataBase/firebase";
import PieChart from "../Components/PieChart";
import Histograms from "../Components/Histograms";
import QuizContainer from "../Elements/QuizContainer";
import QuizInfo from "../Elements/QuizInfo";

const MainLayoutPage = () => {
  // Styles
  const styles = {
    quizData: {
      width: "100%",
      height: "70%",
      display: "flex",
      justifyContent: "center",
    },
    answersBlock: {
      width: "100%",
      height: "78%",
      padding: "2rem",
      display: "flex",
      flexWrap: "wrap",
      overflowY: "auto",
      borderBottom: "2px solid white",
    },
    choosedAnswerBox: {
      width: "35%",
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
  // find not accepted request
  const findNotAcceptedRequest = requestsArray.map(
    (request) => request.acceptRequst === false
  );
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const [isHover, setIsHover] = useState(null);

  const roomData = rooms.find((room) => room.creatorId === getUserId);
  const quizData = rooms.find((room) => room.roomId === newRoomData);

  // create Quiz
  const [isCreateQuiz, setIsCreateQuiz] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isStartedQuiz, setIsStartedQuiz] = useState(false);
  const [isFinishedParticipantsArray, setIsFinishedParticipantsArray] =
    useState([]); // the state is for map all of the participants data and make a statistics
  const [isFinishedParticipantsData, setIsFinishedParticipantsData] =
    useState(null);
  const [checkParticipantsFinishedData, setCheckParticipantsFinishedData] =
    useState(null);

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

  // if someone cancelled the invitation to quiz

  let notAcceptedRequestCount = 0;

  for (let i = 0; i < requestsArray.length; i++) {
    if (findNotAcceptedRequest) {
      notAcceptedRequestCount++;
    }
  }

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

          setIsFinishedParticipantsArray(findUser);
          setIsFinishedParticipantsData(foundUserData);
        } else {
          setIsFinishedParticipantsArray([]);
          setIsFinishedParticipantsData(null);
        }
      };
      const requestRef = ref(db, `rooms/${userData?.roomId}/requests`);

      const handleRequestsData = (snapshot) => {
        const requests = snapshot.val();

        if (requests) {
          const keys = Object.keys(requests);
          const requestsArray = keys.map((key) => ({
            id: key,
            ...requests[key],
          }));
          setRequestsArray(requestsArray);
          setIsLoadingRequest(false);
        } else {
          setRequestsArray([]);
        }
      };

      const quizRef = ref(db, `rooms/${userData.roomId}/`);

      const handleStartQuiz = async (snapshot) => {
        const isStarted = snapshot.val();

        if (isStarted) {
          setIsStartedQuiz(true);
        }

        if (
          requestsArray.length - notAcceptedRequestCount <= 0 &&
          !isLoadingRequest
        ) {
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
  }, [
    notAcceptedRequestCount,
    isLoadingRequest,
    quizData,
    requestsArray.length,
    roomData,
    userData,
  ]);

  const isParicipantsHover = (participantsId) => {
    setIsHover(participantsId);
  };

  // next - back btn

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [choosedAnswers, setChoosedAnswers] = useState([]);
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [activeAnswerArray, setActiveAnswerArray] = useState([]);

  const selectAnswer = (answerIndex) => {
    if (activeAnswer === answerIndex) {
      setActiveAnswer(null);
    } else {
      const updatedChoosedAnswers = [...choosedAnswers];
      updatedChoosedAnswers[questionIndex] = answerIndex;

      setActiveAnswer(answerIndex);
      setChoosedAnswers(updatedChoosedAnswers);
      setActiveAnswerArray(updatedChoosedAnswers);
    }
    setSelectedAnswer(answerIndex);
  };

  const handleNextButton = () => {
    if (questionIndex + 1 !== quizData.questions.length) {
      if (choosedAnswers.length === questionIndex) {
        setSelectedAnswer(null);
        setActiveAnswer(null);
        setChoosedAnswers([...choosedAnswers, selectedAnswer]);
        setQuestionIndex(questionIndex + 1);
        setActiveAnswerArray([...activeAnswerArray, selectedAnswer]);
      } else {
        const updatedChoosedAnswers = [...choosedAnswers];
        updatedChoosedAnswers[questionIndex] = selectedAnswer;
        setActiveAnswer(activeAnswerArray[questionIndex + 1]);
        setSelectedAnswer(choosedAnswers[questionIndex + 1]);
        setChoosedAnswers(updatedChoosedAnswers);
        setActiveAnswerArray(updatedChoosedAnswers);
        setQuestionIndex(questionIndex + 1);
      }
    } else {
      finishQuiz();
    }
  };

  const handleBackButton = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
      setActiveAnswer(activeAnswerArray[questionIndex - 1]);
      setSelectedAnswer(choosedAnswers[questionIndex - 1]);
    }
  };

  const finishQuiz = async () => {
    let currentPoints = 0;
    const participantPoint = ref(
      db,
      `rooms/${userData.roomId}/participantPoint/` + userData.id
    );
    // Checking if selected answer is right
    for (let i = 0; i < quizData.questions.length; i++) {
      if (choosedAnswers[i] === quizData.questions[i].selectedAnswer) {
        currentPoints++;
      }
    }
    try {
      await set(participantPoint, {
        participantIcon: userData.userIcon,
        participantName: userData.username,
        point: currentPoints,
        choosedAnswer: choosedAnswers,
      });
    } catch (error) {
      alert(error);
    }
  };

  // for conrol information about participants data after finished quiz

  // calculate score
  const calculateScore = (totalQuestions, totalAnswers, maxScore) => {
    const scorePerQuestion = maxScore / totalQuestions;
    let score = scorePerQuestion * totalAnswers;
    if (score === 0) {
      score = 1;
    }
    return score;
  };

  const handleFinishedParticipandsData = (participantId) => {
    const isFoundPointsData = isFinishedParticipantsArray.find(
      (participant) => participant.id === participantId
    );
    if (isFoundPointsData) {
      setCheckParticipantsFinishedData(
        quizData.participantPoint[participantId]
      );
    } else {
      messageApi.open({
        type: "warning",
        content: "The participant doesn`t finish yet",
      });
    }
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
              {newRoomData ? (
                <div className="quiz-container">
                  {userData &&
                  userData.privilege === "Moderator" &&
                  quizData?.creatorId === userData.id ? (
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
                      <QuizContainer
                        userData={userData}
                        checkParticipantsFinishedData={
                          checkParticipantsFinishedData
                        }
                        requestsArray={requestsArray}
                        participantsArray={participantsArray}
                        isFinishedParticipantsArray={
                          isFinishedParticipantsArray
                        }
                        quizData={quizData}
                        isStartedQuiz={isStartedQuiz}
                        notAccepedRequest={notAcceptedRequestCount}
                      />
                    </div>
                  ) : (
                    <>
                      {!isFinishedParticipantsData ? (
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
                              <QuizInfo
                                participantsArray={participantsArray}
                                requestsArray={requestsArray}
                                notAccepedRequest={notAcceptedRequestCount}
                              />
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
                                    {questionIndex + 1}/
                                    {quizData.questions.length}
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
                                          onClick={handleNextButton}
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
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      width: "70%",
                                    }}
                                  >
                                    <h1>
                                      Right answers{" "}
                                      {isFinishedParticipantsData.point}/
                                      {quizData.questions.length}
                                    </h1>
                                    <h3>
                                      Score{" "}
                                      {calculateScore(
                                        quizData.questions.length,
                                        isFinishedParticipantsData.point,
                                        10
                                      )}
                                      /10
                                    </h3>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="quiz-data"
                                style={styles.quizData}
                              >
                                <div
                                  className="statistics-container"
                                  style={{
                                    display: "block",
                                    width: "360px",
                                    height: "475px",
                                    overflowY: "auto",
                                    borderRight: "2px solid white",
                                    borderTop: "2px solid white",
                                    padding: "10px 20px 20px 20px",
                                  }}
                                >
                                  <h2
                                    style={{
                                      display: "flex",
                                      width: "100%",
                                      justifyContent: "center",
                                      color: "orange",
                                    }}
                                  >
                                    Statistics
                                  </h2>

                                  <div
                                    className="pie-chart"
                                    style={{ width: "100%" }}
                                  >
                                    <PieChart
                                      participants={isFinishedParticipantsArray}
                                      questionsQuizLength={
                                        quizData.questions.length
                                      }
                                    />
                                  </div>
                                  <div
                                    className="histograms"
                                    style={{ width: "100%" }}
                                  >
                                    <Histograms
                                      participantsPoints={
                                        isFinishedParticipantsArray
                                      }
                                      questionsQuizLength={
                                        quizData.questions.length
                                      }
                                    />
                                  </div>
                                </div>
                                <div
                                  className="answers-block"
                                  style={styles.answersBlock}
                                >
                                  {quizData.questions.map((question, index) => (
                                    <div
                                      key={question.id}
                                      style={{
                                        ...styles.choosedAnswerBox,
                                        width: "calc(33.33% - 20px)",
                                        margin: "10px",
                                      }}
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
                                              .choosedAnswer[index]
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
                                              .choosedAnswer[index]
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
                                              .choosedAnswer[index]
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
                                  ))}
                                </div>
                              </div>
                              <div
                                className="quiz-setting"
                                style={{
                                  position: "absolute",
                                  top: "93%",
                                  left: "50%",
                                  fontSize: "20px",
                                }}
                              >
                                {" "}
                                <span> Here will be a setting for a quiz</span>
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
        quizData={quizData}
        usersData={users}
        id={getUserId}
        rooms={rooms}
        participants={participantsArray}
      />
    </div>
  );
};

export default MainLayoutPage;
