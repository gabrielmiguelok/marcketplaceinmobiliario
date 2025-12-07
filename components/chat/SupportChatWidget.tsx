"use client"
import { useEffect, useRef, memo, useState } from "react"
import React from "react"

import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, X, Loader2, RotateCcw, ChevronRight, Home, MessageCircle } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"

import type { ChatOption } from "@/lib/chat-flow"
import { useChatManager, type ChatViewMode, type StructuredMessage } from "@/hooks/useChatManager"
import InmuebleCarouselChat from "./InmuebleCarouselChat"

const WIDGET_CONFIG = {
  position: {
    bottom: 90,
    right: 38,
    marginMobile: 24,
    marginDesktop: 36,
  },

  button: {
    size: 60,
    logoScale: 1.15,
    logoTranslateY: 0,
  },

  drag: {
    tapThreshold: 10,
    closeThreshold: 70,
    crossSize: 56,
  },

  ai: {
    maxTokens: 1000,
  },

  texts: {
    companyName: "Aloba",
    assistantName: "Asistente Aloba",
    statusOnline: "En línea",
    buttonAriaLabel: "Abrir asistente virtual Aloba",
    placeholders: {
      conversation: "Escribe tu mensaje...",
      human_support: "¿En qué puedo ayudarte?...",
      business_qa: "Pregunta sobre propiedades, zonas...",
    },
    tooltips: {
      reset: "Reiniciar",
      close: "Cerrar",
      send: "Enviar mensaje",
    },
  },

  images: {
    avatar: "/logo.png",
    avatarAlt: "Aloba",
  },

  colors: {
    primary: "#00F0D0",
    primaryLight: "#00FFE0",
    primaryDark: "#00dbbe",
    secondary: "#0B1B32",
    accent: "#0B1B32",
    shadow: "rgba(0, 240, 208, 0.4)",
    shadowHover: "rgba(0, 240, 208, 0.5)",
  },

  avatarFallback: "AL",
}

export { WIDGET_CONFIG }


const FormattedMessage = memo(({ text }: { text: string }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-[15px] sm:text-sm">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-[#0B1B32]">{children}</strong>,
          ul: ({ children }) => <ul className="space-y-1.5 ml-4 mb-3 list-none">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1.5 ml-4 mb-3 list-none counter-reset-item">{children}</ol>,
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-[15px] sm:text-sm">
              <span className="text-[#00F0D0] mt-0.5 flex-shrink-0">•</span>
              <span className="flex-1 leading-relaxed">{children}</span>
            </li>
          ),
          h1: ({ children }) => <h1 className="text-lg sm:text-base font-semibold mb-2 mt-3 first:mt-0 text-[#0B1B32]">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base sm:text-sm font-semibold mb-1.5 mt-2 first:mt-0 text-[#0B1B32]">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm sm:text-xs font-semibold mb-1 mt-2 first:mt-0 text-[#0B1B32]">{children}</h3>,
          br: () => <br className="block h-2" />,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#00F0D0]/20 text-[#0B1B32] font-medium px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-md hover:bg-[#00F0D0]/30 transition-colors my-0.5 no-underline text-[15px] sm:text-sm"
            >
              {href?.includes("wa.me") && <MessageCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
              {href?.includes("inmuebles") && <Home className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
})
FormattedMessage.displayName = "FormattedMessage"

const ActionOptionsList = memo(
  ({ options, onSelect }: { options: ChatOption[]; onSelect: (option: ChatOption) => void }) => {
    if (!options || options.length === 0) return null

    return (
      <div className="mt-3 flex flex-col gap-2 sm:gap-1.5">
        {options.map((option, i) => (
          <motion.button
            key={option.key || option.label}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
            onClick={() => onSelect(option)}
            className="group w-full text-left rounded-lg p-3 sm:p-2.5 transition-colors duration-200 hover:bg-[#00F0D0]/10 flex items-center gap-3 sm:gap-2.5 border border-transparent hover:border-[#00F0D0]/30 active:bg-[#00F0D0]/15"
          >
            {option.icon && (
              <div className="flex-shrink-0 text-[#0B1B32]/70 group-hover:text-[#0B1B32] transition-colors">
                <option.icon className="h-5 w-5 sm:h-4 sm:w-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[15px] sm:text-sm text-[#0B1B32]">{option.label}</p>
              {option.description && (
                <p className="text-sm sm:text-xs text-gray-500 truncate mt-0.5">{option.description}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-[#00F0D0] transition-colors" />
          </motion.button>
        ))}
      </div>
    )
  },
)
ActionOptionsList.displayName = "ActionOptionsList"

const MessageBubble = memo(
  ({ message, onOptionSelect }: { message: StructuredMessage; onOptionSelect: (option: ChatOption) => void }) => {
    const user = { full_name: "Usuario", picture: null }
    const isUser = message.role === "user"
    const hasOptions = !isUser && message.options && message.options.length > 0
    const hasInmuebles = message.type === "inmuebles" && message.inmuebles && message.inmuebles.length > 0

    if (hasInmuebles) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-start gap-2.5 sm:gap-2 w-full"
        >
          <Avatar className="h-9 w-9 sm:h-7 sm:w-7 flex-shrink-0 ring-2 ring-[#00F0D0]/30 shadow-sm">
            <AvatarImage
              src={WIDGET_CONFIG.images.avatar}
              alt="Asistente Aloba"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-[#00F0D0] to-[#00dbbe] text-[#0B1B32] text-sm sm:text-xs font-semibold">
              {WIDGET_CONFIG.avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <InmuebleCarouselChat inmuebles={message.inmuebles!} searchTerms={message.searchTerms} />
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn("flex items-start gap-2.5 sm:gap-2 w-full", isUser && "justify-end")}
      >
        {!isUser && (
          <Avatar className="h-9 w-9 sm:h-7 sm:w-7 flex-shrink-0 ring-2 ring-[#00F0D0]/30 shadow-sm">
            <AvatarImage
              src={WIDGET_CONFIG.images.avatar}
              alt="Asistente Aloba"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-[#00F0D0] to-[#00dbbe] text-[#0B1B32] text-sm sm:text-xs font-semibold">
              {WIDGET_CONFIG.avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            "rounded-2xl min-w-0 relative transition-all duration-200",
            isUser
              ? "bg-gradient-to-r from-[#0B1B32] to-[#1a2d4a] text-white rounded-br-sm px-4 py-2.5 sm:px-3 sm:py-2 shadow-md max-w-[80%]"
              : hasOptions
                ? "w-full max-w-full bg-white border border-[#00F0D0]/20 shadow-md rounded-2xl p-4 sm:p-3"
                : "max-w-[85%] bg-white text-[#0B1B32] rounded-bl-sm p-4 sm:p-3 shadow-md border border-[#00F0D0]/20",
            message.error && "bg-red-50 border-red-300 !text-red-900",
          )}
        >
          {message.text && <FormattedMessage text={message.text} />}
          {hasOptions && <ActionOptionsList options={message.options} onSelect={onOptionSelect} />}
        </div>
        {isUser && (
          <Avatar className="h-9 w-9 sm:h-7 sm:w-7 flex-shrink-0 shadow-sm ring-2 ring-[#0B1B32]/20">
            <AvatarImage src={user?.picture ?? undefined} alt={user?.full_name || "Usuario"} />
            <AvatarFallback className="bg-gradient-to-br from-[#0B1B32] to-[#1a2d4a] text-white font-semibold text-sm sm:text-xs">
              {getInitials(user.full_name || "U")}
            </AvatarFallback>
          </Avatar>
        )}
      </motion.div>
    )
  },
)
MessageBubble.displayName = "MessageBubble"

const ChatHeader = memo(
  ({
    onReset,
    onClose,
    title = WIDGET_CONFIG.texts.assistantName,
  }: { onReset: () => void; onClose: () => void; title?: string }) => (
    <header className="flex items-center justify-between border-b border-[#00F0D0]/20 bg-white p-4 sm:p-3 flex-shrink-0">
      <div className="flex items-center gap-3 sm:gap-2.5 min-w-0">
        <Avatar className="h-10 w-10 sm:h-8 sm:w-8 border border-[#00F0D0]/30 shadow-sm">
          <AvatarImage
            src={WIDGET_CONFIG.images.avatar}
            alt={WIDGET_CONFIG.images.avatarAlt}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-[#00F0D0] to-[#00dbbe] text-[#0B1B32] text-sm sm:text-xs font-semibold">
            {WIDGET_CONFIG.avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="font-semibold text-[#0B1B32] flex items-center gap-2 truncate text-base sm:text-sm">
            <span className="truncate">{title}</span>
          </h3>
          <p className="text-sm sm:text-xs text-[#00F0D0] font-medium flex items-center gap-1.5">
            <span className="h-2 w-2 sm:h-1.5 sm:w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            {WIDGET_CONFIG.texts.companyName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-1.5">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onReset} className="hover:bg-[#00F0D0]/10 h-10 w-10 sm:h-8 sm:w-8">
                <RotateCcw className="h-5 w-5 sm:h-4 sm:w-4 text-[#0B1B32]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{WIDGET_CONFIG.texts.tooltips.reset}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[#00F0D0]/10 h-10 w-10 sm:h-8 sm:w-8">
                <X className="h-5 w-5 sm:h-4 sm:w-4 text-[#0B1B32]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{WIDGET_CONFIG.texts.tooltips.close}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  ),
)
ChatHeader.displayName = "ChatHeader"

const ChatInput = ({
  onSendMessage,
  viewMode,
}: {
  onSendMessage: (text: string) => void
  viewMode: ChatViewMode
}) => {
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)

  const placeholderText = WIDGET_CONFIG.texts.placeholders[viewMode] || WIDGET_CONFIG.texts.placeholders.conversation

  const handleSubmit = () => {
    if (!inputValue.trim()) return
    setIsSending(true)
    onSendMessage(inputValue)
    setInputValue("")
    setTimeout(() => setIsSending(false), 800)
  }

  const isInputDisabled = isSending

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={placeholderText}
        className="pr-12 h-12 sm:h-10 text-base sm:text-sm border border-[#00F0D0]/30 focus:border-[#00F0D0] transition-all duration-200"
        disabled={isInputDisabled}
      />
      <div className="absolute right-2.5 sm:right-2 top-1/2 -translate-y-1/2 flex items-center">
        {isSending ? (
          <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin text-[#00F0D0]" />
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 sm:h-7 sm:w-7 text-[#0B1B32] hover:text-[#0B1B32] hover:bg-[#00F0D0]/10 transition-all duration-200"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isInputDisabled}
            aria-label={WIDGET_CONFIG.texts.tooltips.send}
          >
            <Send className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

const ChatInterface = ({ onClose }: { onClose: () => void }) => {
  const { messages, viewMode, isTyping, handleSendMessage, handleOptionSelect, resetChat } = useChatManager()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, isTyping])

  const getHeaderTitle = () => WIDGET_CONFIG.texts.assistantName

  const renderContent = () => {
    return (
      <div className="space-y-4 sm:space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onOptionSelect={handleOptionSelect} />
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2.5 sm:gap-2"
          >
            <Avatar className="h-9 w-9 sm:h-7 sm:w-7 flex-shrink-0 ring-2 ring-[#00F0D0]/30 shadow-sm">
              <AvatarImage
                src={WIDGET_CONFIG.images.avatar}
                alt={WIDGET_CONFIG.images.avatarAlt}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#00F0D0] to-[#00dbbe] text-[#0B1B32] text-sm sm:text-xs font-semibold">
                {WIDGET_CONFIG.avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 sm:p-3 shadow-md border border-[#00F0D0]/20">
              <div className="flex items-center gap-2 sm:gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 bg-[#00F0D0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 bg-[#00F0D0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 bg-[#00F0D0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white sm:rounded-xl overflow-hidden shadow-xl border border-[#00F0D0]/20">
      <ChatHeader onReset={resetChat} onClose={onClose} title={getHeaderTitle()} />
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-3 bg-gradient-to-b from-[#00F0D0]/5 to-white min-h-0">
        {renderContent()}
      </main>
      <footer className="border-t border-[#00F0D0]/20 bg-white flex-shrink-0 p-4 sm:p-3">
        <ChatInput onSendMessage={handleSendMessage} viewMode={viewMode} />
      </footer>
    </div>
  )
}

interface FloatingChatButtonProps {
  onClick: () => void
  isOpen: boolean
}

function FloatingChatButton({ onClick, isOpen }: FloatingChatButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-24 right-[24px] sm:right-[36px] z-40"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-[#0B1B32] hover:bg-[#0B1B32]/90 text-white rounded-full shadow-lg shadow-[#0B1B32]/25 hover:shadow-xl hover:shadow-[#0B1B32]/30 transition-all duration-300 px-4 py-3"
        aria-label={WIDGET_CONFIG.texts.buttonAriaLabel}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
        <span className="font-semibold text-sm whitespace-nowrap">
          {isOpen ? "Cerrar" : "Ayuda IA"}
        </span>
      </motion.button>

      {!isOpen && (
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[#0B1B32] rounded-full -z-10"
        />
      )}
    </motion.div>
  )
}

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <FloatingChatButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-[60] pointer-events-auto p-0 sm:inset-auto sm:bottom-24 sm:right-5 sm:w-full sm:max-w-[32rem] sm:h-[calc(100vh-7rem)] sm:max-h-[750px] sm:p-0"
          >
            <ChatInterface onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
