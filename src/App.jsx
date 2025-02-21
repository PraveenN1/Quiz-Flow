import React from 'react'
import { Routes,Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import QuizApp from './pages/Quizapp'

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/app' element={<QuizApp/>}/>
      </Routes>
    </>
  )
}

export default App