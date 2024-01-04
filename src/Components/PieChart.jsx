import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ participants, questionsQuizLength }) => {
  const chartContainer = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (participants.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chartData = {
        labels: [
          `More ${questionsQuizLength / 2} points`,
          `Less ${questionsQuizLength / 2} points`,
        ],
        datasets: [
          {
            label: "Participants score",
            data: [
              participants.filter(
                (participant) => participant.point > questionsQuizLength / 2
              ).length,
              participants.filter(
                (participant) => participant.point <= questionsQuizLength / 2
              ).length,
            ],
            backgroundColor: ["#480ee9", "#FF6384"],
          },
        ],
      };

      const ctx = chartContainer.current.getContext("2d");

      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Distribution of participants by points",
              color: "#000",
              padding: {
                top: 15,
                bottom: 15,
              },
            },
            bodyFont: {
              fontColor: "#fff",
            },
            legend: {
              position: "bottom",
              display: "block",
              labels: {
                color: "#fff",
              },
            },
          },
        },
      });
    }
  }, [participants, questionsQuizLength]);

  return (
    <canvas style={{ display: "block", color: "#fff" }} ref={chartContainer} />
  );
};

export default PieChart;
