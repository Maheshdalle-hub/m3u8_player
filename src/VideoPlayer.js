import React, { useRef, useState, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [m3u8Url, setM3u8Url] = useState("");

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const handleLoadM3U8 = () => {
    if (playerRef.current && m3u8Url) {
      playerRef.current.src({
        src: m3u8Url,
        type: "application/x-mpegURL",
      });

      playerRef.current.ready(() => {
        if (playerRef.current.hlsQualitySelector) {
          playerRef.current.hlsQualitySelector({ displayCurrentQuality: true });
        }
      });
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter M3U8 URL"
        value={m3u8Url}
        onChange={(e) => setM3u8Url(e.target.value)}
      />
      <button onClick={handleLoadM3U8}>Load Stream</button>

      <div className="player-container">
        <video ref={videoRef} className="video-js vjs-default-skin" />
      </div>
    </div>
  );
};

export default VideoPlayer;
