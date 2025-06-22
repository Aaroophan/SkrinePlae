'use client'

import * as React from 'react'
import { ThemeProvider as CustomThemeProvider } from '@/lib/theme'

export function ThemeProvider({ children, ...props }: { children: React.ReactNode }) {
  return <CustomThemeProvider {...props}>{children}</CustomThemeProvider>
}
