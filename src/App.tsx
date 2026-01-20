import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './App.css'

const App: FC = () => {
  return (
    <div className='app-container'>
      <Navbar />
      <main className='main-content'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App

