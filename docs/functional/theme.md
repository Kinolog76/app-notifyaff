# Theme System

## Overview
Light/dark mode theming with persistent user preference.

## Components
- [ThemeProvider](../../components/theme/theme-provider.tsx) - Context provider
- [ThemeScript](../../components/theme/theme-script.tsx) - Anti-flash script
- [ThemeToggle](../../components/theme/theme-toggle.tsx) - Toggle button

## Storage
Theme preference stored in localStorage as `'theme'` key.

## Values
- `'light'` - Light mode
- `'dark'` - Dark mode
- `'system'` - Follow system preference

## Usage
```tsx
import { useTheme } from '@/components/theme/theme-provider'

const { theme, setTheme } = useTheme()
setTheme('dark')
```
