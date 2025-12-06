// server.js
const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = Number.parseInt(process.env.PORT) || 37400
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Almacenará todos los clientes (res) y el canal (string) al que están suscritos.
const clients = new Map()

/**
 * Envía datos a los clientes conectados a un canal específico.
 * @param {string} channel - El canal al que se enviarán los datos.
 * @param {any} data - Los datos a enviar.
 */
function broadcast(channel, data) {
  console.log(`Broadcasting to channel: ${channel}`)
  for (const [res, clientChannel] of clients.entries()) {
    // Envía si el canal del cliente coincide exactamente.
    if (clientChannel === channel) {
      // Formato de Server-Sent Events: "data: {json_string}\n\n"
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }
}

// Hacemos la función 'broadcast' accesible globalmente para las API Routes.
global.broadcast = broadcast

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // Endpoint para eventos en tiempo real (Server-Sent Events)
      if (pathname === "/api/chat/events") {
        // SOLUCIÓN: Si no se especifica un canal, se asume que es el dashboard.
        // Esto mantiene la compatibilidad con el dashboard existente.
        const channel = query.channel || "admin-dashboard"

        if (typeof channel !== "string") {
          res.writeHead(400, { "Content-Type": "text/plain" })
          res.end("Invalid 'channel' query parameter")
          return
        }

        // Establecer las cabeceras para una conexión SSE
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Cache-Control",
        })
        res.write(":ok\n\n") // Enviar un comentario para mantener la conexión viva

        // Suscribir al cliente al canal solicitado.
        clients.set(res, channel)
        console.log(`Client connected to channel: ${channel}. Total clients: ${clients.size}`)

        // Cuando el cliente se desconecta, lo eliminamos de la lista.
        req.on("close", () => {
          clients.delete(res)
          console.log(`Client disconnected from channel: ${channel}. Total clients: ${clients.size}`)
        })

        // No cerramos la respuesta aquí, se queda abierta.
        return
      }

      // Para todas las demás peticiones, dejamos que Next.js las maneje.
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> NexusChat Platform ready on http://${hostname}:${port}`)
    console.log(`> WebSocket events available on port ${port}`)
  })
})
