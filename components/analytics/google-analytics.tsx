"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

type Props = { id: string }

function sendPageview(id: string, url: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("config", id, { page_path: url })
  }
}

export function GoogleAnalytics({ id }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname
    sendPageview(id, url)
  }, [id, pathname, searchParams])

  return (
    <>
      <Script id="ga-src" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${id}', { send_page_view: false });
          `,
        }}
      />
    </>
  )
}
