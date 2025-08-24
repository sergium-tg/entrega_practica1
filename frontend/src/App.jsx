import React from 'react'
import Books from './components/Books.jsx'

export default function App(){
  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <div className="brand">Biblioteca</div>
          <div className="muted"></div>
        </div>
      </header>
      <div className="container">
        <Books />
      </div>
    </>
  )
}
