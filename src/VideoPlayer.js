import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const m3u8Url = "https://d1kw75zcv4u98c.cloudfront.net/out/v1/c843fae2d8ac47ffbe15b3988abf9adb/index.m3u8"; // your fixed M3U8 URL here

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      sources: [
        {
          src: m3u8Url,
          type: "application/x-mpegURL",
        },
      ],
    });

    playerRef.current.ready(() => {
      if (playerRef.current.hlsQualitySelector) {
        playerRef.current.hlsQualitySelector({ displayCurrentQuality: true });
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [m3u8Url]);

  return (
    <div>
      <div className="player-container">
        <video ref={videoRef} className="video-js vjs-default-skin" />
      </div>
    </div>
  );
};

export default VideoPlayer;
