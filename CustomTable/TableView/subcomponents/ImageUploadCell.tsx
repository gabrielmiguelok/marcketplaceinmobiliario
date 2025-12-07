"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"

type ImageUploadCellProps = {
  imageUrl: string | null
  rowId: string
  size?: number
  onImageUpload?: (rowId: string, file: File) => Promise<void>
  isDarkMode?: boolean
}

export default function ImageUploadCell({
  imageUrl,
  rowId,
  size = 32,
  onImageUpload,
  isDarkMode = false,
}: ImageUploadCellProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isClickingRef = useRef(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [cacheKey, setCacheKey] = useState(() => Date.now())
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const prevImageUrlRef = useRef<string | null>(imageUrl)

  useEffect(() => {
    if (imageUrl !== prevImageUrlRef.current) {
      setCacheKey(Date.now())
      setImageError(false)
      setLocalPreview(null)
      prevImageUrlRef.current = imageUrl
    }
  }, [imageUrl])

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const isNewRecord = String(rowId).startsWith('temp_')
  const canUpload = Boolean(onImageUpload) && !isNewRecord && !isUploading
  const hasImage = localPreview || (imageUrl && !imageError)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    if (isClickingRef.current) return

    if (e.shiftKey && hasImage) {
      setShowModal(true)
      return
    }

    if (!canUpload) {
      if (hasImage) {
        setShowModal(true)
      }
      return
    }

    isClickingRef.current = true

    const input = fileInputRef.current
    if (input) {
      input.click()
    }

    setTimeout(() => {
      isClickingRef.current = false
    }, 500)
  }, [canUpload, hasImage])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasImage) {
      setShowModal(true)
    }
  }, [hasImage])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImageUpload) return

    if (localPreview) {
      URL.revokeObjectURL(localPreview)
    }
    const previewUrl = URL.createObjectURL(file)
    setLocalPreview(previewUrl)

    setIsUploading(true)
    setImageError(false)

    try {
      await onImageUpload(rowId, file)
      setCacheKey(Date.now())
    } catch (error) {
      console.error('Error uploading image:', error)
      setLocalPreview(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [onImageUpload, rowId, localPreview])

  const getImageSrc = (useThumb = true) => {
    if (localPreview) {
      return localPreview
    }
    if (imageUrl) {
      if (
        imageUrl.startsWith('/productos/') ||
        imageUrl.startsWith('/comprobantes/') ||
        imageUrl.startsWith('/inmuebles/') ||
        imageUrl.startsWith('/uploads/')
      ) {
        let finalPath = imageUrl
        if (useThumb && imageUrl.startsWith('/inmuebles/') && !imageUrl.includes('/thumb-')) {
          const filename = imageUrl.split('/').pop()
          finalPath = `/inmuebles/thumb-${filename}`
        }
        return `/api/imagen${finalPath}?t=${cacheKey}`
      }
      return `${imageUrl}?t=${cacheKey}`
    }
    return null
  }

  const getFullImageSrc = () => getImageSrc(false)

  const srcWithCache = getImageSrc()

  if (!hasImage) {
    return (
      <div
        onClick={handleClick}
        style={{
          width: size,
          height: size,
          borderRadius: '4px',
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px dashed ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
          cursor: canUpload ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          opacity: isUploading ? 0.5 : 1,
        }}
        title={isNewRecord ? "Guarde el registro primero" : canUpload ? "Click para subir imagen" : "Sin imagen"}
        onMouseEnter={(e) => {
          if (canUpload) {
            e.currentTarget.style.borderColor = '#3b82f6'
            e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : '#eff6ff'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isDarkMode ? '#4b5563' : '#d1d5db'
          e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'
        }}
      >
        {isUploading ? (
          <div
            style={{
              width: size * 0.4,
              height: size * 0.4,
              border: '2px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        ) : (
          <svg
            width={size * 0.45}
            height={size * 0.45}
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{
          width: size,
          height: size,
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          cursor: canUpload ? 'pointer' : hasImage ? 'zoom-in' : 'default',
          position: 'relative',
          transition: 'all 0.15s ease',
          opacity: isUploading ? 0.7 : 1,
        }}
        title={canUpload ? "Click: cambiar | Doble click: ver" : hasImage ? "Click para ver imagen" : ""}
        onMouseEnter={(e) => {
          if (canUpload || hasImage) {
            e.currentTarget.style.borderColor = '#3b82f6'
            e.currentTarget.style.transform = 'scale(1.05)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isDarkMode ? '#374151' : '#e5e7eb'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: size * 0.4,
                height: size * 0.4,
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        )}

        <img
          src={srcWithCache!}
          alt="Imagen"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => {
            if (!localPreview) {
              setImageError(true)
            }
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              ✕
            </button>
            <img
              src={getFullImageSrc()!}
              alt="Imagen completa"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
