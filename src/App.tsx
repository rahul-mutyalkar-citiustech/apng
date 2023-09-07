import "./styles.css";
import { useState } from "react";
import { PNGMetadata } from "./png-metadata.util.ts";
import parseAPNG from "apng-js";

export default function App() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [info, setInfo] = useState("");

  const loadFile = async (my_file: string) => {
    const response = await fetch(my_file);
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    return new Uint8Array(await response.arrayBuffer());
  };

  const load = async (file: string) => {
    try {
      console.log("loading file");
      setInfo("loading file: " + file);
      setImgSrc(file);
      const fileData = await loadFile(file);
      setInfo("file loaded: " + file);
      setInfo("extracting chunks: " + file);
      const chunks = PNGMetadata.extractChunks(fileData);
      setInfo("Extracted chunks " + chunks.length);
      console.log("extractChunks", chunks.length);
    } catch (error) {
      setInfo("Error: " + error);
    }
  };

  const load2 = async (file: string) => {
    try {
      const arrayBuffer = await loadFile(file);
      const apng = parseAPNG(arrayBuffer);
      const array = new Uint8Array(arrayBuffer);
      console.log("array.length", array.length);
      const textChunks = PNGMetadata.readMetadata(array).tEXt;
      const metaData = textChunks.meta ? JSON.parse(textChunks.meta) : null;
      setInfo(
        "framesCount: " +
          metaData?.frames.length +
          ", metaData" +
          JSON.stringify(textChunks)
      );
      setImgSrc(file);
    } catch (error) {
      setInfo("Error: " + error);
    }
  };

  return (
    <div className="App">
      <div style={{ height: 30 }}>
        <button onClick={() => load2("./video-dev.png")}>Load dev file</button>
        <button onClick={() => load2("./video-prod.png")}>
          Load prod file
        </button>
        <button onClick={() => load2("./video-elephant.png")}>
          Load elephant file
        </button>
      </div>
      <div>
        <p>{info}</p>
      </div>
      {imgSrc && (
        <div style={{ width: 200, height: 200 }}>
          <img src={imgSrc} alt="test-file" />
        </div>
      )}
    </div>
  );
}
