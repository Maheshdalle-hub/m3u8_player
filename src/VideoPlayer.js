import React, { useRef, useState } from "react";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [startIndex, setStartIndex] = useState(28201);
  const [endIndex, setEndIndex] = useState(28800);
  const [baseUrl, setBaseUrl] = useState("http://d1kw75zcv4u98c.cloudfront.net/out/v1/287810d967cc428e9bd992002e55b72c/");
  const [tokenParam, setTokenParam] = useState("?m=1733765650");
  const [loading, setLoading] = useState(false);

  const playTSFiles = async () => {
    setLoading(true);
    const video = videoRef.current;
    if (!video || !window.MediaSource) return;

    const mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener("sourceopen", async () => {
      const sourceBuffer = mediaSource.addSourceBuffer('video/mp2t; codecs="avc1.42E01E, mp4a.40.2"');

      for (let i = startIndex; i <= endIndex; i++) {
        const tsUrl = `${baseUrl}index_1_${i}.ts${tokenParam}`;
        try {
          const response = await fetch(tsUrl);
          const arrayBuffer = await response.arrayBuffer();

          await new Promise((resolve) => {
            sourceBuffer.addEventListener("updateend", resolve, { once: true });
            sourceBuffer.appendBuffer(arrayBuffer);
          });
        } catch (error) {
          console.error(`Failed to load ${tsUrl}`, error);
          break;
        }
      }

      mediaSource.endOfStream();
      setLoading(false);
    });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Base URL (up to folder/)"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
      />
      <input
        type="number"
        placeholder="Start Index"
        value={startIndex}
        onChange={(e) => setStartIndex(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="End Index"
        value={endIndex}
        onChange={(e) => setEndIndex(Number(e.target.value))}
      />
      <input
        type="text"
        placeholder="Token or Params (e.g., ?m=...)"
        value={tokenParam}
        onChange={(e) => setTokenParam(e.target.value)}
      />
      <button onClick={playTSFiles} disabled={loading}>
        {loading ? "Loading..." : "Play .TS Stream"}
      </button>

      <video
        ref={videoRef}
        controls
        style={{ width: "100%", marginTop: "20px" }}
      ></video>
    </div>
  );
};

export default VideoPlayer;
