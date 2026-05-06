import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { FaUserCircle } from 'react-icons/fa'
import { BsRobot } from 'react-icons/bs'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

function App() {

  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function generateAnswer() {
    if (!question.trim()) return
    const API_KEY = import.meta.env.VITE_API_KEY
    const currentQuestion = question
    setMessages(prev => [...prev, { role: "user", text: currentQuestion }])
    setQuestion("")
    setLoading(true)

    let retries = 3

    while (retries > 0) {
      try {
        const response = await axios({
          url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
          method: "POST",
          data: {
            contents: [
              {
                role: "user",
                parts: [{ text: currentQuestion }]
              }
            ]
          }
        })

        const aiText = response.data.candidates[0].content.parts[0].text

        setMessages(prev => [...prev, { role: "ai", text: aiText }])
        break

      } catch (error) {
        console.log(error.response?.data || error.message)

        if (error.response?.status === 503) {
          retries--
          await new Promise(res => setTimeout(res, 2000))
        } else {
          setMessages(prev => [...prev, { role: "ai", text: "Sorry, something went wrong. Please try again." }])
          break
        }
      }
    }

    setLoading(false)
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} flex flex-col h-screen`}>


      <div className={`${darkMode ? "bg-gray-800" : "bg-gray-300"} fixed top-0 left-0 w-full  p-4 z-10`}>
        <div className="flex justify-between items-center max-w-3xl mx-auto">

          <h1 className="text-3xl font-bold">Chat-Bot</h1>

          <div className="flex gap-2">

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-md bg-gray-500"
            >
              {darkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>

            <button
              type="button"

              onClick={() => setMessages([])}
              className="bg-red-500 text-white px-3 py-1 rounded-md mr-3 "
            >
              Clear
            </button>
          </div>

        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-20 pb-28 px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >

              {msg.role === "ai" && <BsRobot className="text-2xl mt-1" />}

              <div
                className={`px-4 py-3 rounded-xl max-w-[80%] sm:max-w-[70%] wrap-break-words ${msg.role === "user"
                  ? "bg-green-500 text-white"
                  : darkMode
                    ? "bg-gray-700"
                    : "bg-gray-300"
                  }`}
              >
                {msg.role === "ai"
                  ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                  : msg.text}
              </div>

              {msg.role === "user" && <FaUserCircle className="text-2xl mt-1" />}

            </div>
          ))}

          {loading && (
            <div className="text-left text-gray-400">AI is typing...</div>
          )}

          <div ref={chatEndRef}></div>

        </div>
      </div>

      <div className={`${darkMode ? "bg-gray-800" : "bg-gray-300"} fixed bottom-0 left-0 w-full p-4`}>
        <div className="flex max-w-3xl mx-auto gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything..."
            className={`flex-1 border p-3 rounded-md outline-none ${darkMode ? "bg-gray-700 text-white border-gray-600" : ""
              }`}
            onKeyDown={(e) => e.key === "Enter" && generateAnswer()}
          />

          <button
            onClick={generateAnswer}
            disabled={loading}
            className="bg-green-500 text-white disabled:opacity-50 px-5 rounded-md"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App