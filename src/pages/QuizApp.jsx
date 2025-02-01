import React, { useState, useEffect } from "react";
import { Trophy, Star, Timer, X } from "lucide-react";
import { motion } from "framer-motion";
import Card from "../components/Card";
import Button from "../components/Button";
import Progress from "../components/Progress";

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState("start");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedExplanation, setExpandedExplanation] = useState(null);
  const [powerUps, setPowerUps] = useState({
    fiftyFifty: true,
    extraTime: true,
    skip: true,
  });

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/Uw5CrX"); 
        if (!response.ok) throw new Error("Failed to fetch quiz data");
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, []);

  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const startQuiz = () => {
    setGameState("playing");
    setTimeLeft(30);
    setScore(0);
    setStreak(0);
    setCurrentQuestion(0);
    setShowResults(false);
    setAnswers([]);
    setSelectedAnswer(null);
    setExpandedExplanation(null); 
    setPowerUps({
      fiftyFifty: true,
      extraTime: true,
      skip: true,
    });
  };

  const calculatePoints = (isCorrect) => {
    if (!isCorrect) return 0;

    const basePoints = Number(quizData.correct_answer_marks) || 100;
    const timeBonus = timeLeft * 2;
    const streakBonus = streak * 50;

    return basePoints + timeBonus + streakBonus;
  };

  const usePowerUp = (type) => {
    if (type === "extraTime" && powerUps.extraTime) {
      setTimeLeft(timeLeft + 5);
      setPowerUps((prev) => ({ ...prev, extraTime: false }));
      setScore(score-2);
    } else if (type === "skip" && powerUps.skip) {
      handleNextQuestion();
      setPowerUps((prev) => ({ ...prev, skip: false }));
    } else if (type === "fiftyFifty" && powerUps.fiftyFifty) {
      const currentQ = quizData.questions[currentQuestion];
      setScore(score-5);
      // Get the incorrect answers
      const incorrectAnswers = currentQ.options.filter(
        (option) => !option.is_correct
      );

      // Randomly pick 2 incorrect answers to eliminate
      const toRemove = [];
      while (toRemove.length < 2 && incorrectAnswers.length > 0) {
        const randomIndex = Math.floor(Math.random() * incorrectAnswers.length);
        toRemove.push(incorrectAnswers.splice(randomIndex, 1)[0]);
      }

      // Update the options by removing the 2 incorrect answers
      const updatedOptions = currentQ.options.filter(
        (option) => option.is_correct || !toRemove.includes(option)
      );

      setQuizData((prev) => ({
        ...prev,
        questions: prev.questions.map((q, index) =>
          index === currentQuestion ? { ...q, options: updatedOptions } : q
        ),
      }));

      setPowerUps((prev) => ({ ...prev, fiftyFifty: false }));
    }
  };

  const handleAnswer = (selectedOption) => {
    const currentQ = quizData.questions[currentQuestion];
    const isCorrect = selectedOption.is_correct;
    const points = calculatePoints(isCorrect);

    setSelectedAnswer(selectedOption);
    if (isCorrect) {
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      if (streak + 1 === 5) {
        setTimeLeft(timeLeft + 5);
      }
      const bonus = timeLeft > 5 ? 10 : timeLeft > 2 ? 5 : 2; // Faster = More points
      setScore(score + bonus);
    } else {
      setStreak(0);
      setScore((prev) => prev - Number(quizData.negative_marks || 0));
    }

    setAnswers([
      ...answers,
      {
        question: currentQ.description,
        userAnswer: selectedOption.description,
        correctAnswer: currentQ.options.find((opt) => opt.is_correct)
          .description,
        isCorrect,
        points,
        explanation: currentQ.detailed_solution,
      },
    ]);

    setTimeout(handleNextQuestion, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData?.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
      setPowerUps({
        fiftyFifty: true,
        extraTime: true,
        skip: true,
      });
    } else {
      setGameState("results");
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <div className="text-center p-6">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const renderStartScreen = () => (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-xl border border-gray-200">
      <div className="text-center mb-6 font-poppins">
        <div className="text-2xl font-semibold mb-4 text-gray-700 text-balance">
          "Knowledge is power. The more you learn, the more you earn!"
        </div>
      </div>
      <div className="text-3xl font-bold text-center mb-6 font-poppins text-gray-800">
        {quizData.title || "Welcome to the Quiz Challenge!"}
      </div>
      <div className="space-y-4 font-rubik">
        <div className="text-center space-y-2">
          <p className="text-lg text-gray-600">
            {quizData.description || "Test your knowledge and earn points!"}
          </p>
          <div className="text-gray-500">
            <p>🎯 {quizData.correct_answer_marks} points for correct answers</p>
            <p>
              ❌ {quizData.negative_marks} points deducted for wrong answers
            </p>
            <p>⏱️ Duration: {quizData.duration} minutes</p>
            <p>📝 Total Questions: {quizData.questions_count}</p>
          </div>
        </div>
        <Button
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md focus:outline-none transition duration-300 transform hover:scale-105"
          onClick={startQuiz}
        >
          Start Quiz
        </Button>
      </div>
    </Card>
  );

  const renderQuestion = () => {
    const question = quizData.questions[currentQuestion];
    return (
      <Card className="w-full max-w-2xl">
        <div className="p-6">
          <Button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white absolute top-5 right-5"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to end the test? Your progress will be lost."
                )
              ) {
                window.location.href = "/app"; 
              }
            }}
          >
            End Test
          </Button>
          <div className="my-5 flex justify-between items-center">
            <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
              <Timer className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{timeLeft}s</span>
            </div>
            <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Streak: {streak}</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="font-medium">{score} pts</span>
            </div>
          </div>
          <div>
          <div className="flex gap-10 my-4 justify-center text-black font-semibold text-md">
              <button
                className={`px-4 py-2 bg-yellow-300 rounded ${
                  !powerUps.fiftyFifty && "opacity-50"
                }`}
                onClick={() => usePowerUp("fiftyFifty")}
                disabled={!powerUps.fiftyFifty}
              >
                50-50
              </button>
              <button
                className={`px-4 py-2 bg-green-400 rounded ${
                  !powerUps.extraTime && "opacity-50"
                }`}
                onClick={() => usePowerUp("extraTime")}
                disabled={!powerUps.extraTime}
              >
                +5 sec
              </button>
              <button
                className={`px-4 py-2 bg-red-400 rounded ${
                  !powerUps.skip && "opacity-50"
                }`}
                onClick={() => usePowerUp("skip")}
                disabled={!powerUps.skip}
              >
                Skip
              </button>
            </div>
          </div>

          <Progress
            value={((currentQuestion + 1) / quizData.questions.length) * 100}
          />

          <p className="text-xl font-medium mt-4">{question.description}</p>
          <div className="grid grid-cols-1  gap-3 mt-6">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-lg text-left transition-all duration-200
                  ${
                    selectedAnswer === null
                      ? "hover:bg-gray-50 border-2 border-gray-200 cursor-pointer"
                      : selectedAnswer === option
                      ? option.is_correct
                        ? "bg-green-100 border-2 border-green-500 text-green-700"
                        : "bg-red-100 border-2 border-red-500 text-red-700"
                      : selectedAnswer !== null && option.is_correct
                      ? "bg-green-100 border-2 border-green-500 text-green-700"
                      : "border-2 border-gray-200"
                  }`}
              >
                {option.description}
              </button>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  // Function to toggle explanation visibility
  const toggleExplanation = (index) => {
    if (expandedExplanation === index) {
      setExpandedExplanation(null); // Collapse if clicked again
    } else {
      setExpandedExplanation(index); // Expand the clicked explanation
    }
  };

  const renderResults = () => (
    <Card className="w-full max-w-2xl font-poppins">
      <div className="p-6">
        <h2 className="text-center text-3xl font-bold">Quiz Complete!</h2>
        <p className="text-center text-2xl mt-4">Final Score: {score}</p>
        <div className="mt-6">
          {answers.map((answer, index) => (
            <div
              key={index}
              className={`mt-2 p-4 rounded-lg ${
                answer.isCorrect
                  ? "bg-green-50 border-2 border-green-200"
                  : "bg-red-50 border-2 border-red-200"
              }`}
            >
              <p className="font-medium mb-2">
                Question {index + 1}: {answer.question}
              </p>
              <div className="text-sm space-y-1 font-serif">
                <p
                  className={
                    answer.isCorrect ? "text-green-600" : "text-red-600"
                  }
                >
                  Your answer: {answer.userAnswer}
                </p>
                <p
                  className={
                    answer.isCorrect ? "text-green-600" : "text-red-600"
                  }
                >
                  Correct answer: {answer.correctAnswer}
                </p>
                <p className="font-semibold text-gray-700">
                  Points: {answer.points}
                </p>

                {/* Explanation with animation */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: expandedExplanation === index ? "auto" : 0,
                    opacity: expandedExplanation === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden "
                >
                  <p className="text-gray-600 mt-2">{answer.explanation}</p>
                </motion.div>

                {/* Button to toggle explanation visibility */}
                <button
                  className="text-blue-500 text-sm mt-2"
                  onClick={() => toggleExplanation(index)}
                >
                  {expandedExplanation === index
                    ? "Hide Explanation"
                    : "Show Explanation"}
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" onClick={startQuiz}>
          Try Again
        </Button>
        <Button
          className="w-full mt-4 bg-red-600 hover:bg-red-700"
          onClick={() => (window.location.href = "/app")} 
        >
          End Quiz
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      {gameState === "start" && renderStartScreen()}
      {gameState === "playing" && renderQuestion()}
      {gameState === "results" && renderResults()}
    </div>
  );
};

export default QuizApp;
