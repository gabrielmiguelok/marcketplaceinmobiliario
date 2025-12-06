// hooks/useChatManager.ts

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { chatFlow, type ChatOption } from "@/lib/chat-flow"

export interface DoctorResult {
  id: number
  usuario: string
  full_name: string
  first_name: string | null
  last_name: string | null
  picture: string | null
  especialidad: string | null
  direccion_consultorio: string | null
  anos_experiencia: number | null
  pacientes_atendidos: number | null
}

export type StructuredMessage = {
  id: string
  role: "user" | "assistant" | "system"
  type: "text" | "options" | "doctors"
  text?: string
  options?: ChatOption[]
  doctors?: DoctorResult[]
  searchTerms?: string[]
  error?: boolean
  source?: "llm" | "flow" | "system"
  step?: string
}

export type ChatViewMode = "conversation" | "human_support" | "business_qa"
type ApiMessage = { role: "user" | "assistant"; content: string }

const USE_STREAM = true
const MAX_TURNS = 8

export const useChatManager = () => {
  const [messages, setMessages] = useState<StructuredMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const viewMode: ChatViewMode = "business_qa"
  const isConnecting = false
  const humanSupportConversationId: string | null = null

  // Usuario por defecto - el widget funciona sin auth
  const user = { nombre: "Usuario" }
  const initialized = useRef(false)

  const appendMessage = useCallback((msg: Omit<StructuredMessage, "id"> & { id?: string }) => {
    const id = msg.id ?? crypto.randomUUID()
    setMessages((prev) => [...prev, { ...msg, id }])
    return id
  }, [])

  const updateMessage = useCallback((id: string, patch: Partial<StructuredMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])

  const renderFlowStep = useCallback(
    (stepKey: string) => {
      const step = chatFlow[stepKey] || chatFlow["DEFAULT"]
      const text =
        step.assistantMessages
          ?.map((m) => (typeof m === "function" ? m(user) : m))
          .filter(Boolean)
          .join("\n\n") || ""
      if (text) appendMessage({ role: "assistant", type: "text", text, source: "flow", step: stepKey })
      if (step.options?.length)
        appendMessage({ role: "assistant", type: "options", options: step.options, source: "flow", step: stepKey })
    },
    [appendMessage, user],
  )

  const showWelcome = useCallback(() => {
    renderFlowStep("MAIN")
  }, [renderFlowStep])

  useEffect(() => {
    if (!initialized.current) {
      showWelcome()
      initialized.current = true
    }
  }, [showWelcome])

  const SAFE_DEFAULT =
    "¡Hola! Soy el Asistente Virtual de DocTop. Puedo ayudarte a buscar médicos, conocer cómo funciona la plataforma, o responder tus preguntas. ¿En qué puedo ayudarte?"

  const sanitize = (t: string) =>
    (t || "")
      .replace(/contentReference|oaicite|\[[0-9]+\]/gi, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

  const handleBusinessInfoQuery = useCallback(
    async (text: string) => {
      console.log("[DocTop] Enviando mensaje al chatbot:", text)
      appendMessage({ role: "user", type: "text", text, source: "system" })
      setIsTyping(true)

      const base = messages
        .filter((m) => m.type === "text" && (m.role === "user" || (m.role === "assistant" && m.source === "llm")))
        .map<ApiMessage>((m) => ({ role: m.role as "user" | "assistant", content: m.text || "" }))
      const apiHistory = base.slice(-MAX_TURNS * 2).concat({ role: "user", content: text })

      console.log("[DocTop] Historial de mensajes para API:", apiHistory.length, "mensajes")

      try {
        if (USE_STREAM) {
          console.log("[DocTop] Llamando a /api/chat-business-info con streaming")
          const res = await fetch("/api/chat-business-info?stream=1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: apiHistory }),
            cache: "no-store",
            credentials: "same-origin",
            keepalive: true,
          })

          console.log("[DocTop] Respuesta de API recibida:", res.status, res.ok)

          if (res.ok && res.body) {
            // Check if it's streaming or JSON response
            const contentType = res.headers.get("content-type") || ""

            if (contentType.includes("application/json")) {
              // Non-streaming response with potential doctors
              const data = await res.json()
              console.log("[DocTop] JSON response received:", data)

              appendMessage({
                role: "assistant",
                type: "text",
                text: sanitize(data?.content) || SAFE_DEFAULT,
                source: "llm",
              })

              // Si hay doctores, agregar mensaje con carrusel
              if (data?.doctors && data.doctors.length > 0) {
                console.log("[DocTop] Doctors found:", data.doctors.length)
                appendMessage({
                  role: "assistant",
                  type: "doctors",
                  doctors: data.doctors,
                  searchTerms: data.searchTerms,
                  source: "llm",
                })
              }
            } else {
              // Streaming response
              const tempId = crypto.randomUUID()
              appendMessage({ id: tempId, role: "assistant", type: "text", text: "", source: "llm" })

              const reader = res.body.getReader()
              const decoder = new TextDecoder()
              let acc = ""

              while (true) {
                const { value, done } = await reader.read()
                if (done) break
                acc += decoder.decode(value, { stream: true })
                updateMessage(tempId, { text: sanitize(acc) })
              }

              console.log("[DocTop] Respuesta completa recibida:", acc.substring(0, 100) + "...")
            }
          } else {
            console.log("[DocTop] Request falló, intentando sin streaming")
            const res2 = await fetch("/api/chat-business-info", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: apiHistory }),
              cache: "no-store",
              credentials: "same-origin",
              keepalive: true,
            })
            console.log("[DocTop] Respuesta sin streaming:", res2.status, res2.ok)
            const data = res2.ok ? await res2.json().catch(() => null as any) : null
            console.log("[DocTop] Datos recibidos:", data)
            appendMessage({
              role: "assistant",
              type: "text",
              text: sanitize(data?.content) || SAFE_DEFAULT,
              source: "llm",
            })

            // Si hay doctores, agregar mensaje con carrusel
            if (data?.doctors && data.doctors.length > 0) {
              appendMessage({
                role: "assistant",
                type: "doctors",
                doctors: data.doctors,
                searchTerms: data.searchTerms,
                source: "llm",
              })
            }
          }
        } else {
          console.log("[DocTop] Llamando a /api/chat-business-info sin streaming")
          const res = await fetch("/api/chat-business-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: apiHistory }),
            cache: "no-store",
            credentials: "same-origin",
            keepalive: true,
          })
          console.log("[DocTop] Respuesta de API:", res.status, res.ok)
          const data = res.ok ? await res.json().catch(() => null as any) : null
          console.log("[DocTop] Datos recibidos:", data)
          appendMessage({
            role: "assistant",
            type: "text",
            text: sanitize(data?.content) || SAFE_DEFAULT,
            source: "llm",
          })

          // Si hay doctores, agregar mensaje con carrusel
          if (data?.doctors && data.doctors.length > 0) {
            appendMessage({
              role: "assistant",
              type: "doctors",
              doctors: data.doctors,
              searchTerms: data.searchTerms,
              source: "llm",
            })
          }
        }
      } catch (err) {
        console.error("[DocTop] Error en /api/chat-business-info:", err)
        appendMessage({ role: "assistant", type: "text", text: SAFE_DEFAULT, source: "llm" })
      } finally {
        setIsTyping(false)
        console.log("[DocTop] Proceso de mensaje completado")
      }
    },
    [appendMessage, messages, updateMessage],
  )

  const handleSendMessage = useCallback(
    (t: string) => {
      if (!t.trim()) return
      return handleBusinessInfoQuery(t)
    },
    [handleBusinessInfoQuery],
  )

  const handleOptionSelect = useCallback(
    (option: ChatOption) => {
      appendMessage({ role: "user", type: "text", text: option.label, source: "flow" })
      setTimeout(() => renderFlowStep(option.nextStep), 120)
    },
    [appendMessage, renderFlowStep],
  )

  const resetChat = useCallback(() => {
    setMessages([])
    setIsTyping(false)
    setTimeout(showWelcome, 0)
  }, [showWelcome])

  return {
    messages,
    viewMode,
    isTyping,
    isConnecting,
    humanSupportConversationId,
    handleSendMessage,
    handleOptionSelect,
    resetChat,
  }
}
