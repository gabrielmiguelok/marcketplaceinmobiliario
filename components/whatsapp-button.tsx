"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  const whatsappNumber = "50230000000"
  const message = encodeURIComponent("¡Hola! Me interesa conocer más sobre las propiedades disponibles en Aloba.")
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
      className="fixed right-6 bottom-6 z-[55]"
    >
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] rounded-full shadow-[0_10px_30px_-5px_rgba(0,240,208,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(0,240,208,0.5)] transition-all duration-300 px-5 py-3"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-bold text-sm whitespace-nowrap">
          ¡Hablemos!
        </span>
      </motion.a>

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
        className="absolute inset-0 bg-[#00F0D0] rounded-full -z-10"
      />
    </motion.div>
  )
}
