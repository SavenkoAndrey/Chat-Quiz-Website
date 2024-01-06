import React from "react";

const QuizInfo = ({ participantsArray, requestsArray, notAccepedRequest }) => {
  return (
    <div className="quiz-info">
      <div className="quiz-info-header">
        <h1>
          Count of ready partiscipants:{" "}
          <span style={{ color: "red" }}>{participantsArray.length}</span>/
          <span style={{ color: "#3fdf06" }}>
            {requestsArray.length +
              participantsArray.length -
              notAccepedRequest}
          </span>
        </h1>
      </div>
      <div className="info-text">
        <span>
          The quiz will begin when all participants are ready, however you
          already able to use the chat with partiscipants
        </span>
      </div>
    </div>
  );
};

export default QuizInfo;
