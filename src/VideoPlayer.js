import React, { useRef, useState, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [startNum, setStartNum] = useState("");
  const [endNum, setEndNum] = useState("");
  const [queryParam, setQueryParam] = useState("");

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

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const generatePlaylist = () => {
    if (!baseUrl || !startNum || !endNum) return;

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
            { length: Number(endNum) - Number(startNum) + 1 },
            (_, i) => `#EXTINF:10.0,\n${baseUrl}index_${index}_${Number(startNum) + i}.ts${queryParam}`
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
      <button onClick={generatePlaylist}>Load Stream</button>

      <div className="player-container">
        <video ref={videoRef} className="video-js vjs-default-skin" />
      </div>
    </div>
  );
};

export default VideoPlayer;
