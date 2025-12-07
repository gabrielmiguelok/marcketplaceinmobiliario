'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface NoResultsOverlayProps {
  noResultsText?: string;
  isDarkMode?: boolean;
}

export default function NoResultsOverlay({ noResultsText, isDarkMode = false }: NoResultsOverlayProps) {
  const BRAND = '#127CF3';

  return (
    <Box
      sx={{
        textAlign: 'center',
        p: '32px',
        color: isDarkMode ? 'var(--foreground, #f0f0f0)' : 'var(--foreground, #333)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        inset: 0,
        backgroundColor: isDarkMode ? 'var(--background, oklch(0.12 0.01 240))' : 'var(--background, #fff)',
        zIndex: 9999,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem', opacity: 0.7 }}>
        {noResultsText}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, opacity: 0.5, fontSize: '0.8rem' }}>
        Los registros aparecerán aquí cuando estén disponibles.
      </Typography>

      <div style={{ marginTop: 16, width: 36, height: 3, borderRadius: 2, background: BRAND, opacity: 0.4 }} />
    </Box>
  );
}
