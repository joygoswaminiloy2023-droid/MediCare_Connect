'use client'

export default function Loading() {
  return (
    <div style={styles.container}>
      <div style={styles.monitor}>
     
        <svg width="200" height="100" viewBox="0 0 200 100" style={styles.svg}>
         
          <path
            d="M0 50 L40 50 L50 20 L70 80 L80 50 L120 50 L130 10 L150 90 L160 50 L200 50"
            fill="none"
            stroke="#00A3E0"
            strokeWidth="2"
            style={{ opacity: 0.2 }}
          />
          
       
          <path
            d="M0 50 L40 50 L50 20 L70 80 L80 50 L120 50 L130 10 L150 90 L160 50 L200 50"
            fill="none"
            stroke="#00A3E0"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pulse-line"
          />
        </svg>
        
       
        <div className="scan-dot"></div>
      </div>

      <h2 style={styles.text}>System Heartbeat</h2>
      <p style={styles.subtext}>Synchronizing medical data...</p>

      <style>{`
        .pulse-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: draw-pulse 2s linear infinite;
        }

        .scan-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #14b8a6;
          border-radius: 50%;
          box-shadow: 0 0 10px #14b8a6, 0 0 20px #14b8a6;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          animation: move-dot 2s linear infinite;
        }

        @keyframes draw-pulse {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes move-dot {
          0% { left: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '90vh',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif',
  },
  monitor: {
    position: 'relative',
    width: '200px',
    height: '100px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '20px',
  },
  svg: {
    display: 'block',
  },
  text: {
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: 'bold',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    margin: '10px 0',
  },
  subtext: {
    color: '#14b8a6',
    fontSize: '0.8rem',
    opacity: 0.8,
  }
}