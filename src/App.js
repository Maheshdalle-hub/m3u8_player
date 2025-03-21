import React from "react";
import VideoPlayer from "./VideoPlayer";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <h1>YouTube M3U8 Player</h1>
      <VideoPlayer />
    </div>
  );
};

export default App;