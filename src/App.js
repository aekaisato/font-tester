import { useDropzone } from "react-dropzone";
import { useCallback, useState } from 'react';
import html2canvas from "html2canvas";

function stripChars(str) {
  str = str.replace(/[\W-]/g, "-").trim();
  return str;
}

function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue(value => value + 1);
}

function App() {
  const forceUpdate = useForceUpdate();

  const onDrop = useCallback((acceptedFiles) => {
    let fontNameArr = [];
    acceptedFiles.forEach(async (file) => {
      if (file.type.includes("font") || "ttf otf woff woff2".includes(file.name.substring(file.name.lastIndexOf(".") + 1))) {
        console.log("loading " + file.name + "...")
        let strippedFileName = stripChars(file.name);
        console.log(strippedFileName)
        let arrayBuffer = await file.arrayBuffer();
        let font = new FontFace(strippedFileName, arrayBuffer);
        console.log(font);
        await font.load();
        document.fonts.add(font);
        fontNameArr.push({strippedFileName, name: file.name});
        forceUpdate();
      } else {
        console.warn(file.name + " is not a font. ignoring...")
      }
    })
    setFonts(fontNameArr);
  }, [forceUpdate]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({onDrop});

  const [fonts, setFonts] = useState([]);
  const [text, setText] = useState("Lorem Ipsum");
  const [fontSize, setFontSize] = useState(48);

  return (
    <div className="flex w-full justify-center items-center p-4 flex-col">
      <h1 className="text-lg font-bold mb-3">Multi Font Tester — MiFT</h1>
      <div className="flex w-full flex-row justify-evenly items-center">
        <div {...getRootProps()} className="bg-gray-300 p-3 rounded">
          <input {...getInputProps()} />
          {
          isDragActive ?
          <p>drop fonts here...</p> :
          <p>drag and drop fonts here, or click to select</p>
          }
        </div>
        <div>
          <label>text</label>
          <input type="text" className="border-2 border-gray-400 ml-3 rounded"
            onChange={(event) => {setText(event.target.value)}} />
        </div>
        <div>
          <label>font size</label>
          <input type="range" value={fontSize} min="4" max="200" step="4" className="ml-3 mr-3" 
            onChange={(event) => {setFontSize(Number.parseInt(event.target.value))}}/>
          <label>{fontSize}</label>
        </div>
      </div>
      <div className="p-5" id="fontResults">
        {fonts.map((value) => (
          <div key={value.strippedFileName}>
            <p>{value.name}</p>
            <h2 style={{fontFamily: value.strippedFileName, fontSize: fontSize}}>{text}</h2>
          </div>
        ))}
      </div>

      { fonts.length > 0 ?
      <div>
        <input type="button" value="save results as image" className="p-1 rounded" onClick={async () => {
          let canvas = await html2canvas(document.querySelector(("#fontResults")));
          let link = document.createElement("a");
          let dateStr = new Date().toString();
          link.download = "font preview - " + dateStr + ".png";
          link.href = canvas.toDataURL();
          link.click();
          link.remove();
        }} title="i recommend to manually take a screenshot instead; html2canvas is pretty wonky with text"/>
      </div>
      : <div/>
      }
    </div>
  );
}

export default App;
