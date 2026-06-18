'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {

    console.error("Runtime Error:", error)
  }, [error])

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Something went wrong!</h2>
      <p style={styles.message}>{error.message || "We encountered an unexpected error."}</p>
      <button
        onClick={() => reset()} // 'reset' attempts to re-render the segment
        style={styles.button}
      >
        Try again
      </button>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', fontFamily: 'sans-serif' },
  heading: { fontSize: '2rem', marginBottom: '10px' },
  message: { color: '#666', marginBottom: '20px' },
  button: { padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
}