import { Form } from "antd";
import { ref, update } from "firebase/database";
import React, { useState } from "react";
import Histograms from "../Components/Histograms";
import PieChart from "../Components/PieChart";
import { db } from "../DataBase/firebase";

const QuizContainer = ({
  userData,
  checkParticipantsFinishedData,
  requestsArray,
  participantsArray,
  isFinishedParticipantsArray,
  quizData,
  isStartedQuiz,
  notAccepedRequest
}) => {
  const styles = {
    quizData: {
      width: "100%",
      height: "70%",
      display: "flex",
      justifyContent: "center",
    },

    choosedAnswerBox: {
      maxWidth: "35%",
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
      width: "300px",
      height: "475px",
      overflowY: "auto",
      borderLeft: "2px solid white",
      borderTop: "2px solid white",
      padding: "0 20px 20px 20px",
    },
  };

  const handleStartQuiz = async () => {
    const quizRef = ref(db, `rooms/${userData.roomId}/`);
    try {
      await update(quizRef, { isStarted: true });
    } catch (error) {
      console.error(error);
    }
  };

  const [openRequest, setOpenRequest] = useState(true);
  const [openStatistics, setOpenStatistics] = useState(false);

  const handleOpenRequest = () => {
    setOpenStatistics(false);
    setOpenRequest(true);
  };

  const handleOpenStatistic = () => {
    setOpenRequest(false);
    setOpenStatistics(true);
  };

  return (
    <>
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
                                  src={participant.participantsIcon}
                                  alt="participant-icon"
                                />
                              </div>
                              <span>{participant.participantsName}</span>
                              <div className="request-user-block">
                                {participant.acceptRequest === undefined ? (
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
                Count of ready partiscipants: {participantsArray.length}/
                {requestsArray.length + participantsArray.length - notAccepedRequest}
              </h1>
            </div>
            <div className="info-text">
              <span>
                The quiz will begin when all participants are ready, If you
                wanna start quiz immediately, click on the button below
              </span>
            </div>
            <div className="quiz-container-right-side-start-btn">
              <button onClick={handleStartQuiz} className="start-btn">
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
              width: "26%",
              padding: "0 0px 0 20px",
            }}
          >
            <div className="setting-icons">
              <div className="requests" onClick={handleOpenRequest}>
                <span
                  id="requests"
                  className={`material-symbols-outlined ${
                    openRequest ? "active" : ""
                  }`}
                >
                  public
                </span>
              </div>
              <div className="statistics" onClick={handleOpenStatistic}>
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
                                    src={participant.participantsIcon}
                                    alt="participant-icon"
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    width: "35%",
                                  }}
                                  className="request-participants-name"
                                >
                                  <span>{participant.participantsName}</span>
                                </div>
                                <div className="request-user-block">
                                  {participant.acceptRequest === undefined ? (
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
                      color: "orange",
                    }}
                  >
                    Statistics
                  </h2>

                  <div
                    className="statistics-container"
                    style={styles.statisticsBlock}
                  >
                    <div className="pie-chart" style={{ width: "100%" }}>
                      <PieChart
                        participants={isFinishedParticipantsArray}
                        questionsQuizLength={quizData.questions.length}
                      />
                    </div>
                    <div className="histograms" style={{ width: "100%" }}>
                      <Histograms
                        participantsPoints={isFinishedParticipantsArray}
                        questionsQuizLength={quizData.questions.length}
                      />
                    </div>
                    <div className="trouble-question"></div>
                  </div>
                </Form.Item>
              </Form>
            )}
          </div>
          {checkParticipantsFinishedData ? (
            <div className="quiz-container-right-side" style={{ width: "74%" }}>
              <div className="quiz-container-right-side-header">
                <div className="header-info" style={{ display: "block" }}>
                  <h1>{checkParticipantsFinishedData.participantName}</h1>
                  <h2
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      color: "orange",
                    }}
                  >
                    Score: {checkParticipantsFinishedData.point}/
                    {quizData.questions.length}
                  </h2>
                </div>
              </div>
              <div
                className="quiz-data"
                style={{
                  display: "flex",
                  width: "100%",
                  height: "53.5%",
                  borderBottom: "2px solid white",
                  overflowY: "auto",
                  flexWrap: "wrap",
                }}
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
                    <div className="question" style={styles.question}>
                      <h3>
                        {index + 1}. {question.questionInput}
                      </h3>
                      <span>
                        {question.answers[
                          checkParticipantsFinishedData.choosedAnswer[index]
                        ] === question.answers[question.selectedAnswer] ? (
                          <span style={{ color: "#00fa53" }}>+1</span>
                        ) : (
                          <span style={{ color: "red" }}>0</span>
                        )}
                      </span>
                    </div>
                    <div
                      className="choosed-answer"
                      style={
                        question.answers[
                          checkParticipantsFinishedData.choosedAnswer[index]
                        ] === question.answers[question.selectedAnswer]
                          ? styles.rightAnswer
                          : styles.wrongAnswer
                      }
                    >
                      {
                        question.answers[
                          checkParticipantsFinishedData.choosedAnswer[index]
                        ]
                      }
                    </div>
                    <div className="right-answer" style={styles.rightAnswer}>
                      {question.answers[question.selectedAnswer]}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="quiz-setting"
                style={{
                  width: "100%",
                  height: "12%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {" "}
                <span> Here will be a setting for a quiz</span>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default QuizContainer;
