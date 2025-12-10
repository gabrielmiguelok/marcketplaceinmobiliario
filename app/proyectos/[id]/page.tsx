import { redirect, notFound } from "next/navigation"
import { getInmuebleById } from "@/lib/services/inmuebles-service"
import { slugify } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string }>
}

export default async function InmuebleRedirectPage({ params }: Props) {
  const { id } = await params
  const inmueble = await getInmuebleById(parseInt(id))

  if (!inmueble) {
    notFound()
  }

  const slug = slugify(inmueble.titulo)
  redirect(`/proyectos/${inmueble.id}/${slug}`)
}
