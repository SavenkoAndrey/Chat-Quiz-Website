import React from "react";

const AnswerInput = ({ value, onChange, removeAnswer, selectAnswer }) => {
  return (
    <div>
      <input
        type="radio"
        name="answers"
        // checked={isSelected}
        value={value}
        onChange={selectAnswer}
        id="answer"
      />
      <input
        type="text"
        value={value}
        id="answer-input"
        placeholder="Type answer"
        onChange={onChange}
      />
      <span
        onClick={removeAnswer}
        style={{
          fontSize: "30px",
          transform: "translateY(10px)",
          color: "#d6d6d6",
          cursor: "pointer",
        }}
        className="material-symbols-outlined"
      >
        remove
      </span>
    </div>
  );
};

export default AnswerInput;
