import React, { useRef, useState, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const lastTap = useRef(0);

  const [baseUrl, setBaseUrl] = useState("");
  const [startNum, setStartNum] = useState("");
  const [endNum, setEndNum] = useState("");
  const [queryParam, setQueryParam] = useState("");
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("baseUrl");
    const start = params.get("startNum");
    const end = params.get("endNum");
    const query = params.get("queryParam") || "";

    if (url && start && end) {
      setBaseUrl(url);
      setStartNum(start);
      setEndNum(end);
      setQueryParam(query);
      setAutoMode(true);
      setTimeout(() => {
        generatePlaylist(url, start, end, query);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      fluid: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
    });

    playerRef.current.hlsQualitySelector({
      displayCurrentQuality: true,
    });

    const videoEl = videoRef.current;
    const container = videoEl.parentElement;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let holdTimeout = null;
    let speedHeld = false;

    const handleTouchStart = () => {
      if (!isMobile) return;
      holdTimeout = setTimeout(() => {
        if (playerRef.current && !speedHeld) {
          speedHeld = true;
          playerRef.current.playbackRate(2);
        }
      }, 1000);
    };

    const handleTouchEnd = () => {
      if (!isMobile) return;
      clearTimeout(holdTimeout);
      if (playerRef.current && speedHeld) {
        playerRef.current.playbackRate(1);
        speedHeld = false;
      }
    };

    const handleDoubleTap = (event) => {
      const currentTime = Date.now();
      const tapGap = currentTime - lastTap.current;
      lastTap.current = currentTime;

      const touch = event.changedTouches ? event.changedTouches[0] : event;
      const rect = container.getBoundingClientRect();
      const tapX = touch.clientX - rect.left;
      const width = rect.width;

      if (tapGap < 300) {
        if (tapX < width / 3) {
          playerRef.current.currentTime(playerRef.current.currentTime() - 10);
        } else if (tapX > (2 * width) / 3) {
          playerRef.current.currentTime(playerRef.current.currentTime() + 10);
        } else {
          playerRef.current.paused()
            ? playerRef.current.play()
            : playerRef.current.pause();
        }
      }
    };

    videoEl.addEventListener("touchstart", handleTouchStart);
    videoEl.addEventListener("touchend", handleTouchEnd);
    videoEl.addEventListener("touchend", handleDoubleTap);
    videoEl.addEventListener("click", handleDoubleTap); // also works on desktop

    return () => {
      videoEl.removeEventListener("touchstart", handleTouchStart);
      videoEl.removeEventListener("touchend", handleTouchEnd);
      videoEl.removeEventListener("touchend", handleDoubleTap);
      videoEl.removeEventListener("click", handleDoubleTap);
      if (playerRef.current) playerRef.current.dispose();
    };
  }, []);

  const generatePlaylist = (url = baseUrl, start = startNum, end = endNum, query = queryParam) => {
    if (!url || !start || !end) return;

    const qualities = {
      240: 1,
      360: 2,
      480: 3,
      720: 5,
    };

    let masterPlaylist = `#EXTM3U\n#EXT-X-VERSION:3\n`;

    Object.entries(qualities).forEach(([label, index]) => {
      const variantUrl = URL.createObjectURL(new Blob([
        `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n` +
          Array.from(
            { length: Number(end) - Number(start) + 1 },
            (_, i) => `#EXTINF:10.0,\n${url}index_${index}_${Number(start) + i}.ts${query}`
          ).join("\n") +
          `\n#EXT-X-ENDLIST`
      ], { type: "application/vnd.apple.mpegurl" }));

      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${label}000,RESOLUTION=${label}x720\n${variantUrl}\n`;
    });

    const masterBlob = new Blob([masterPlaylist], { type: "application/vnd.apple.mpegurl" });
    const masterUrl = URL.createObjectURL(masterBlob);

    playerRef.current.src({
      src: masterUrl,
      type: "application/x-mpegURL",
    });
  };

  return (
    <div>
      {!autoMode && (
        <>
          <input
            type="text"
            placeholder="Base URL"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="Start Number"
            value={startNum}
            onChange={(e) => setStartNum(e.target.value)}
          />
          <input
            type="text"
            placeholder="End Number"
            value={endNum}
            onChange={(e) => setEndNum(e.target.value)}
          />
          <input
            type="text"
            placeholder="Query Parameter"
            value={queryParam}
            onChange={(e) => setQueryParam(e.target.value)}
          />
          <button onClick={() => generatePlaylist()}>Load Stream</button>
        </>
      )}
      <div className="player-container">
        <video ref={videoRef} className="video-js vjs-default-skin" />
      </div>
    </div>
  );
};

export default VideoPlayer;
