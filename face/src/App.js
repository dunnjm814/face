import React, {useState, useEffect, useRef} from 'react'
import * as faceapi from 'face-api.js'
import './App.css';

function App() {
  const videoHeight = 400;
  const videoWidth = 640;
  const [initializing, setInitializing] = useState(false)
  const videoRef = useRef()
  const canvasRef = useRef()

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + './models'
      setInitializing(true)
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startVideo)
    }
    loadModels()
  }, [])

  const startVideo = () => {
    navigator.getUserMedia(
      {
        video: {},
      },
      (stream) => {
        videoRef.current.srcObject = stream;
      },
      function (err) {
        console.log("The following error occurred: " + err.name);
      }
    );
  }

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (initializing) {
        setInitializing(false)
      }
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
      const displaySize = {
        width: videoWidth,
        height: videoHeight
      }
      faceapi.matchDimensions(canvasRef.current, displaySize)
      const detection = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      const resizedDetections = faceapi.resizeResults(detection, displaySize)
      canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight)
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections)
    }, 500)
  }

  return (
    <div className="App">
      <span>{initializing ? "initializing" : "ready"}</span>
      <div className='wrapper'>
        <video
          ref={videoRef}
          autoPlay
          muted
          height={videoHeight}
          width={videoWidth}
          onPlay={handleVideoOnPlay}
        />
        <canvas ref={canvasRef} className='canvas' />
      </div>
    </div>
  );
}

export default App;
