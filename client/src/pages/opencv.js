/*import React, { useRef, useEffect } from 'react';

import "../styles/mix.css";
import Webcam from 'react-webcam';


const Opencv = () => {
  
  const webcamRef = useRef(null);

  useEffect(() => {
      const videoElement = webcamRef.current.video;
      const canvasElement = document.createElement('canvas');
      const canvasContext = canvasElement.getContext('2d');
      const imgElement = document.createElement('img');

      document.body.appendChild(canvasElement);

      const handleFrame = () => {
          canvasContext.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
          imgElement.src = canvasElement.toDataURL('image/jpeg');

          fetch('http://localhost:5000/video_feed')
              .then(response => response.blob())
              .then(blob => {
                  const objectURL = URL.createObjectURL(blob);
                  imgElement.src = objectURL;
              });

          requestAnimationFrame(handleFrame);
      };

      handleFrame();
  }, []);

  return (
      <div>
          <Webcam ref={webcamRef} />
          <div>
            <h2>gestures detection using opencv</h2>
            <p>click here for face recognition</p>
            <button onClick={Opencv}>gesture Recognition</button>
            <p></p>
          </div>
      </div>
  );
};

export default Opencv;*/

import React, { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    // Auto-refresh the video feed every 100 milliseconds
    const refreshVideoFeed = () => {
      const videoFeed = document.getElementById('video_feed');
      if (videoFeed) {
        videoFeed.src = `http://localhost:5000/video_feed?${new Date().getTime()}`;
      }
    };

    const intervalId = setInterval(refreshVideoFeed, 100);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Function to stop the Python file
  const stopPythonFile = async () => {
    try {
      // Display a confirmation dialog
      const confirmed = window.confirm('Are you sure you want to stop the Python file?');
      if (!confirmed) {
        return; // Do nothing if the user cancels the operation
      }

      // Send a POST request to the endpoint responsible for stopping the Python file
      const response = await fetch('http://localhost:5000/stop_python_file', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('Python file stopped successfully');
      } else {
        console.error('Failed to stop Python file');
      }
    } catch (error) {
      console.error('Error stopping Python file:', error);
    }
  };

  return (
    <div>
      <h1>Hand Gesture Recognition</h1>
      <img id="video_feed" src="http://localhost:5000/video_feed" alt="Hand Gesture Feed" />

      {/* Button to stop the Python file */}
      <button onClick={stopPythonFile}>Stop Python File</button>
    </div>
  );
};

export default App;
