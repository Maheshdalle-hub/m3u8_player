import React, { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import "./styles.css";

const App = () => {
  const [m3u8Url, setM3u8Url] = useState("");

  return (
    <div className="app-container">
      <h1>YouTube Style M3U8 Player</h1>
      
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter M3U8 URL..."
          value={m3u8Url}
          onChange={(e) => setM3u8Url(e.target.value)}
        />
      </div>

      {m3u8Url && <VideoPlayer m3u8Url={m3u8Url} />}
    </div>
  );
};

export default App;