import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const Histograms = ({ participantsPoints, questionsQuizLength }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (participantsPoints && participantsPoints.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const calculateScore = (totalQuestions, totalAnswers, maxScore) => {
        const scorePerQuestion = maxScore / totalQuestions;
        let score = scorePerQuestion * totalAnswers;
        if (score === 0) {
          score = 1;
        }
        return score;
      };

      const labels = Array.from({ length: 10 }, (_, i) => i + 1);
      const pointsCounts = Object.fromEntries(
        labels.map((label) => [label, 0])
      );

      participantsPoints.forEach((participant) => {
        const totalQuestions = questionsQuizLength;
        const points = participant.point;

        const totalAnswers = points;
        const maxScore = 10;

        const participantScore = calculateScore(
          totalQuestions,
          totalAnswers,
          maxScore
        );

        pointsCounts[participantScore]++;
      });

      const chartData = {
        labels: labels,
        datasets: [
          {
            label: "Participants by Points",
            data: Object.values(pointsCounts),
            backgroundColor: "orange",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };

      const myChartRef = chartRef.current.getContext("2d");

      chartInstance.current = new Chart(myChartRef, {
        type: "bar",
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "red",
              },
            },
            x: {
              beginAtZero: true,
              ticks: {
                color: "black",
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Distribution of participants by points",
              color: "#000",
            },

            bodyFont: {
              fontColor: "#fff",
            },
            legend: {
              position: "bottom",
              display: true,
              labels: {
                color: "#fff",
              },
            },
          },
        },
      });
    }
  }, [participantsPoints, questionsQuizLength]);

  return <canvas ref={chartRef} />;
};

export default Histograms;
