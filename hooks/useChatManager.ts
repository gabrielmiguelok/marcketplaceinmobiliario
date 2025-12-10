"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { chatFlow, type ChatOption } from "@/lib/chat-flow"

export interface InmuebleResult {
  id: number
  titulo: string
  tipo: string
  operacion: string
  precio_usd: number
  precio_gtq: number
  moneda: string
  ubicacion: string | null
  zona: string | null
  departamento: string | null
  metros_cuadrados: number | null
  habitaciones: number | null
  banos: number | null
  parqueos: number | null
  imagen_url: string | null
  destacado: boolean
}

export type StructuredMessage = {
  id: string
  role: "user" | "assistant" | "system"
  type: "text" | "options" | "inmuebles"
  text?: string
  options?: ChatOption[]
  inmuebles?: InmuebleResult[]
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
    "¡Hola! Soy el Asistente Virtual de Aloba. Puedo ayudarte a buscar propiedades, conocer las zonas de Guatemala, o responder tus preguntas sobre inmuebles. ¿En qué puedo ayudarte?"

  const sanitize = (t: string) =>
    (t || "")
      .replace(/contentReference|oaicite|\[[0-9]+\]/gi, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()

  const handleBusinessInfoQuery = useCallback(
    async (text: string) => {
      console.log("[Aloba] Enviando mensaje al chatbot:", text)
      appendMessage({ role: "user", type: "text", text, source: "system" })
      setIsTyping(true)

      const base = messages
        .filter((m) => m.type === "text" && (m.role === "user" || (m.role === "assistant" && m.source === "llm")))
        .map<ApiMessage>((m) => ({ role: m.role as "user" | "assistant", content: m.text || "" }))
      const apiHistory = base.slice(-MAX_TURNS * 2).concat({ role: "user", content: text })

      console.log("[Aloba] Historial de mensajes para API:", apiHistory.length, "mensajes")

      try {
        if (USE_STREAM) {
          console.log("[Aloba] Llamando a /api/chat-business-info con streaming")
          const res = await fetch("/api/chat-business-info?stream=1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: apiHistory }),
            cache: "no-store",
            credentials: "same-origin",
            keepalive: true,
          })

          console.log("[Aloba] Respuesta de API recibida:", res.status, res.ok)

          if (res.ok && res.body) {
            const contentType = res.headers.get("content-type") || ""

            if (contentType.includes("application/json")) {
              const data = await res.json()
              console.log("[Aloba] JSON response received:", data)

              appendMessage({
                role: "assistant",
                type: "text",
                text: sanitize(data?.content) || SAFE_DEFAULT,
                source: "llm",
              })

              if (data?.inmuebles && data.inmuebles.length > 0) {
                console.log("[Aloba] Inmuebles found:", data.inmuebles.length)
                appendMessage({
                  role: "assistant",
                  type: "inmuebles",
                  inmuebles: data.inmuebles,
                  searchTerms: data.searchTerms,
                  source: "llm",
                })
              }
            } else {
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

              console.log("[Aloba] Respuesta completa recibida:", acc.substring(0, 100) + "...")
            }
          } else {
            console.log("[Aloba] Request falló, intentando sin streaming")
            const res2 = await fetch("/api/chat-business-info", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: apiHistory }),
              cache: "no-store",
              credentials: "same-origin",
              keepalive: true,
            })
            console.log("[Aloba] Respuesta sin streaming:", res2.status, res2.ok)
            const data = res2.ok ? await res2.json().catch(() => null as any) : null
            console.log("[Aloba] Datos recibidos:", data)
            appendMessage({
              role: "assistant",
              type: "text",
              text: sanitize(data?.content) || SAFE_DEFAULT,
              source: "llm",
            })

            if (data?.inmuebles && data.inmuebles.length > 0) {
              appendMessage({
                role: "assistant",
                type: "inmuebles",
                inmuebles: data.inmuebles,
                searchTerms: data.searchTerms,
                source: "llm",
              })
            }
          }
        } else {
          console.log("[Aloba] Llamando a /api/chat-business-info sin streaming")
          const res = await fetch("/api/chat-business-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: apiHistory }),
            cache: "no-store",
            credentials: "same-origin",
            keepalive: true,
          })
          console.log("[Aloba] Respuesta de API:", res.status, res.ok)
          const data = res.ok ? await res.json().catch(() => null as any) : null
          console.log("[Aloba] Datos recibidos:", data)
          appendMessage({
            role: "assistant",
            type: "text",
            text: sanitize(data?.content) || SAFE_DEFAULT,
            source: "llm",
          })

          if (data?.inmuebles && data.inmuebles.length > 0) {
            appendMessage({
              role: "assistant",
              type: "inmuebles",
              inmuebles: data.inmuebles,
              searchTerms: data.searchTerms,
              source: "llm",
            })
          }
        }
      } catch (err) {
        console.error("[Aloba] Error en /api/chat-business-info:", err)
        appendMessage({ role: "assistant", type: "text", text: SAFE_DEFAULT, source: "llm" })
      } finally {
        setIsTyping(false)
        console.log("[Aloba] Proceso de mensaje completado")
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
