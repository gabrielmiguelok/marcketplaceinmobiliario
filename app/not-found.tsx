// --- Contenido de: app/not-found.tsx ---
import Link from "next/link"

export const metadata = {
  title: "Página no encontrada | Gabriel Hércules Miguel",
  description: "La página que buscás no existe o fue movida.",
  // ⛔️ NO agregar colorScheme aquí
}

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold mb-4">Página no encontrada</h1>
      <p className="text-gray-600 mb-8">
        La URL puede haber cambiado o no existe.
      </p>
      <Link href="/" className="text-blue-600 underline">
        Volver al inicio
      </Link>
    </main>
  )
}
// --- Fin de: app/not-found.tsx ---
