import React, { useState } from 'react';
import "./App.css";
import Navbar from './components/Navbar';
import { MdOutlineArrowUpward } from "react-icons/md";
import { ImNewTab } from "react-icons/im";
import { IoMdDownload } from "react-icons/io";
import { BiSolidShow } from "react-icons/bi";
import { FaEyeSlash } from "react-icons/fa";
import Editor from '@monaco-editor/react';
import { RiComputerLine } from "react-icons/ri";
import { FaTabletAlt } from "react-icons/fa";
import { ImMobile2 } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import { FadeLoader } from 'react-spinners';
import OpenAI from "openai";

// 1. Define the API Key from Vite Environment
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// 2. Initialize OpenAI using that specific variable name
const openai = new OpenAI({
  apiKey: API_KEY, 
  dangerouslyAllowBrowser: true 
});

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [isShowCode, setIsShowCode] = useState(false);
  const [isInNewTab, setIsInNewTab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewWidth, setPreviewWidth] = useState("100%");
  const [code, setCode] = useState(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Welcome</title>
</head>
<body class="bg-zinc-950 text-white flex items-center justify-center h-screen">
  <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
    Ready to Build?
  </h1>
</body>
</html>`
  );

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webbuilder-site.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  async function getResponse() {
    if (!prompt.trim()) {
      toast.error("Please describe your website first!");
      return;
    }

    setLoading(true);
    setIsShowCode(false);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", 
        messages: [
          { 
            role: "system", 
            content: "You are an elite UI/UX designer. Return ONLY a single code block containing a complete HTML file using Tailwind CSS and GSAP. Include high-quality placeholder images from Unsplash. Write professional marketing copy." 
          },
          { 
            role: "user", 
            content: `Build a premium website for: ${prompt}. Dark mode modern theme.` 
          }
        ],
      });

      const result = response.choices[0].message.content;
      const codeMatch = result.match(/```(?:html)?\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1].trim() : result.trim();
      
      setCode(extractedCode);
      toast.success("Website Generated Successfully!");
    } catch (err) {
      toast.error("Generation failed. Check API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <ToastContainer theme="dark" position="bottom-right" />
      
      <div className="container">
        <h1 className='text-[45px] md:text-[60px] font-[800] leading-tight text-center max-w-4xl'>
          Turn Ideas into <span className='bg-gradient-to-r from-violet-400 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent'>Live Websites</span>
        </h1>
        <p className='mt-4 text-[18px] text-[#b3b3b3] max-w-2xl text-center'>
          Describe your vision and watch AI architect your frontend in seconds.
        </p>

        <div className="inputBox">
          <textarea 
            onChange={(e) => setPrompt(e.target.value)} 
            value={prompt} 
            placeholder='e.g., A luxury watch brand landing page with dark aesthetic and GSAP scroll reveals...'
          ></textarea>
          {prompt && !loading && (
            <i onClick={getResponse} className='sendIcon text-[20px] transition-all hover:scale-110'>
              <MdOutlineArrowUpward />
            </i>
          )}
        </div>

        <div className="preview">
          <div className="header">
            <h3 className='font-bold text-[16px]'>Live Preview</h3>
            <div className="flex items-center gap-[15px]">
              <div onClick={() => setIsInNewTab(true)} className="icon !w-auto !px-4 gap-2">Open Preview <ImNewTab /></div>
              <div onClick={downloadCode} className="icon !w-auto !px-4 gap-2 text-white">Download <IoMdDownload /></div>
              <div onClick={() => setIsShowCode(!isShowCode)} className="icon !w-auto !px-4 gap-2">
                {isShowCode ? "Show Preview" : "Show Code"} {isShowCode ? <BiSolidShow /> : <FaEyeSlash />}
              </div>
            </div>
          </div>

          <div className="content-area">
            {loading ? (
              <div className='w-full h-full flex items-center justify-center flex-col bg-zinc-900'>
                <FadeLoader color='#9933ff'/>
                <h3 className='text-[23px] mt-4 font-semibold'>Generating your masterpiece...</h3>
              </div>
            ) : isShowCode ? (
              <Editor 
                height="100%" 
                theme='vs-dark' 
                defaultLanguage="html" 
                value={code} 
                onChange={(val) => setCode(val)}
                options={{ minimap: { enabled: false } }}
              />
            ) : (
              <iframe srcDoc={code} title="preview"></iframe>
            )}
          </div>
        </div>

        <footer className="footer-section">
          <div className="footer-content">
            <span>Made with</span>
            <span className="heart-icon">❤️</span>
            <span>by <span className="author-name">Kuverdeep Pundir</span></span>
          </div>
          <p className="copyright-text">
            © 2026 WebBuilder AI • All Rights Reserved
          </p>
        </footer>
      </div>

      {isInNewTab && (
        <div className="modelCon">
          <div className="modelBox">
            <div className="header bg-white text-black px-6">
              <h3 className='font-bold gradient-text'>PREVIEW MODE</h3>
              <div className="flex items-center gap-4">
                <div onClick={() => setPreviewWidth("100%")} className={`icon ${previewWidth === "100%" ? "active-icon" : ""}`}><RiComputerLine /></div>
                <div onClick={() => setPreviewWidth("768px")} className={`icon ${previewWidth === "768px" ? "active-icon" : ""}`}><FaTabletAlt /></div>
                <div onClick={() => setPreviewWidth("375px")} className={`icon ${previewWidth === "375px" ? "active-icon" : ""}`}><ImMobile2 /></div>
              </div>
              <div className="icon" onClick={() => { setIsInNewTab(false); setPreviewWidth("100%"); }}><IoMdClose /></div>
            </div>
            <div className="device-canvas">
              <iframe 
                srcDoc={code} 
                style={{ width: previewWidth }} 
                className='responsive-iframe'
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;