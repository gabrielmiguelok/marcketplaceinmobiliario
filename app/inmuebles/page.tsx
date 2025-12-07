import { getInmuebles } from "@/lib/services/inmuebles-service"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import InmueblesGrid from "@/components/InmueblesGrid"
import { MapPin } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function InmueblesPage() {
  const inmuebles = await getInmuebles()

  return (
    <div className="min-h-screen bg-white font-sans text-[#0B1B32] flex flex-col relative selection:bg-[#00F0D0] selection:text-[#0B1B32]">
      <Header activePage="inmuebles" />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-[56px] font-bold text-[#0B1B32] leading-tight tracking-tight mb-4">
              Encuentra tu próximo hogar
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explora nuestra selección de propiedades en las mejores zonas de Guatemala
            </p>
          </div>

          {inmuebles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No hay propiedades disponibles
              </h2>
              <p className="text-gray-600 mb-8">
                Pronto agregaremos nuevas propiedades. ¡Vuelve pronto!
              </p>
              <Link
                href="/conocenos"
                className="inline-flex items-center gap-2 bg-[#00F0D0] hover:bg-[#00dbbe] text-[#0B1B32] font-bold text-lg py-4 px-8 rounded-full transition-all duration-300"
              >
                Volver al inicio
              </Link>
            </div>
          ) : (
            <InmueblesGrid inmuebles={inmuebles as any} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
