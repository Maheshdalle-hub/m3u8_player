import React, { useRef, useState, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [startTs, setStartTs] = useState("");
  const [endTs, setEndTs] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [queryParam, setQueryParam] = useState("");

  const generateM3U8 = () => {
    try {
      const start = parseInt(startTs);
      const end = parseInt(endTs);

      if (isNaN(start) || isNaN(end) || end <= start) return "";

      let playlist = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n";

      for (let i = start; i <= end; i++) {
        playlist += `#EXTINF:10.0,\n${baseUrl}${i}.ts${queryParam}\n`;
      }

      playlist += "#EXT-X-ENDLIST";

      const blob = new Blob([playlist], { type: "application/vnd.apple.mpegurl" });
      return URL.createObjectURL(blob);
    } catch {
      return "";
    }
  };

  const handleLoadTS = () => {
    const m3u8BlobUrl = generateM3U8();

    if (playerRef.current) {
      playerRef.current.src({
        src: m3u8BlobUrl,
        type: "application/x-mpegURL",
      });
      playerRef.current.play();
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      fluid: true,
      preload: "auto",
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="text"
        placeholder="Base URL (without number)"
        onChange={(e) => setBaseUrl(e.target.value)}
      />
      <input
        type="text"
        placeholder="Start Number"
        onChange={(e) => setStartTs(e.target.value)}
      />
      <input
        type="text"
        placeholder="End Number"
        onChange={(e) => setEndTs(e.target.value)}
      />
      <input
        type="text"
        placeholder="Query Param (e.g. ?m=...)"
        onChange={(e) => setQueryParam(e.target.value)}
      />
      <button onClick={handleLoadTS}>Load Video</button>

      <video
        ref={videoRef}
        className="video-js vjs-default-skin"
        controls
        style={{ width: "100%", marginTop: "20px" }}
      />
    </div>
  );
};

export default VideoPlayer;
