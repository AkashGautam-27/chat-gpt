import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
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
  const API_KEYS = [
  import.meta.env.VITE_API_KEY_1,
  import.meta.env.VITE_API_KEY_2,
  import.meta.env.VITE_API_KEY_3
]
    const currentQuestion = question
    setMessages(prev => [...prev, { role: "user", text: currentQuestion }])
    setQuestion("")
    setLoading(true)
  let success = false
    for(const API_KEY of API_KEYS) {
      try {
        const response = await axios({
          url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
          method: "POST",
          data: {
            contents: [
              {
                role: "user",
                parts: [{ text:  `
You are a helpful AI assistant.

Formatting Rules:

- Use proper Markdown
- Use headings and bullet points
- Keep spacing clean
- Use tables if needed

ONLY IF the question contains mathematics:
- Use LaTeX
- Use $ $ for inline maths
- Use $$ $$ for block maths
- Solve step-by-step

Do NOT force maths formatting on normal questions.

Question:
${currentQuestion}
` }]
              }
            ]
          }
        })

        const aiText = response.data.candidates[0].content.parts[0].text

        setMessages(prev => [...prev, { role: "ai", text: aiText }])
        success = true
        break

      } catch (error) {
        console.log(error.response?.data || error.message)
        continue
      }
    }
        if (!success) {
          setMessages(prev => [...prev, { role: "ai", text: "Sorry, something went wrong. Please try again." }])
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
                className={`px-4 py-3 rounded-xl max-w-[80%] sm:max-w-[70%] break-words p-3 ${msg.role === "user"
                  ? "bg-green-500 text-white"
                  : darkMode
                    ? "bg-gray-700"
                    : "bg-gray-300"
                  }`}
              >
  {msg.role === "ai" ? (
     <div
    className={`prose max-w-none ${
      darkMode ? "prose-invert" : ""
    }`}
  >
  <ReactMarkdown
    remarkPlugins={[remarkMath, remarkGfm]}
    rehypePlugins={[rehypeKatex]}
    components={{
      h1: ({ children }) => (
        <h1 className="text-2xl font-bold my-3">{children}</h1>
      ),

      h2: ({ children }) => (
        <h2 className="text-xl font-semibold my-2">{children}</h2>
      ),

      p: ({ children }) => (
        <p className="leading-7 my-2">{children}</p>
      ),

      li: ({ children }) => (
       <li className="ml-6 list-disc marker:text-green-400 my-1">{children}</li>
      ),
      table: ({ children }) => (
  <table className="table-auto border-collapse border border-gray-500 my-3">
    {children}
  </table>
),

th: ({ children }) => (
  <th className="border border-gray-500 px-3 py-2 bg-gray-800">
    {children}
  </th>
),

td: ({ children }) => (
  <td className="border border-gray-500 px-3 py-2">
    {children}
  </td>
),

      code({ inline, children }) {
        return inline ? (
          <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">
            {children}
          </code>
        ) : (
          <pre className="bg-black text-green-400 p-4 rounded-lg overflow-x-auto my-3">
            <code>{children}</code>
          </pre>
        )
      }
    }}
  >
    {msg.text}
  </ReactMarkdown>
  </div>
) : (
  msg.text
)}
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