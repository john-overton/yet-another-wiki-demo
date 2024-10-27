# Theming in Next.js Applications

## Introduction

Theming in Next.js involves creating a consistent look and feel across your application. This summary covers various approaches to implement theming in a Next.js project.

## 1. CSS Modules

CSS Modules provide scoped styling and are built into Next.js.

```jsx
// styles/Button.module.css
.button {
  background-color: var(--primary-color);
  color: white;
}

// components/Button.js
import styles from '../styles/Button.module.css'

const Button = ({ children }) => (
  <button className={styles.button}>{children}</button>
)
```

## 2. Global Styles

Use a global CSS file for app-wide styles.

```jsx
// pages/_app.js
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
```

## 3. CSS-in-JS with styled-components

Install `styled-components` and its babel plugin for server-side rendering.

```jsx
// components/Button.js
import styled from 'styled-components'

const Button = styled.button`
  background-color: ${props => props.theme.primaryColor};
  color: white;
`

export default Button
```

Set up a theme provider:

```jsx
// pages/_app.js
import { ThemeProvider } from 'styled-components'

const theme = {
  primaryColor: '#0070f3',
  // ... other theme variables
}

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
```

## 4. Tailwind CSS

Install Tailwind CSS and configure it for Next.js.

```jsx
// components/Button.js
const Button = ({ children }) => (
  <button className="bg-blue-500 text-white px-4 py-2 rounded">
    {children}
  </button>
)
```

Customize Tailwind theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
      },
    },
  },
  // ... other configurations
}
```

## 5. CSS Variables for Dynamic Theming

Use CSS variables for easy theme switching.

```css
/* styles/globals.css */
:root {
  --primary-color: #0070f3;
}

[data-theme='dark'] {
  --primary-color: #00a8ff;
}

.button {
  background-color: var(--primary-color);
}
```

Switch themes with JavaScript:

```javascript
document.documentElement.setAttribute('data-theme', 'dark')
```

## 6. Theme Switching with React Context

Create a theme context for dynamic theme switching:

```jsx
// contexts/ThemeContext.js
import React, { createContext, useState, useContext } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

Use the theme in components:

```jsx
// components/ThemedButton.js
import { useTheme } from '../contexts/ThemeContext'

const ThemedButton = () => {
  const { theme } = useTheme()
  return (
    <button className={`button ${theme === 'dark' ? 'dark' : ''}`}>
      Click me
    </button>
  )
}
```

## 7. Material-UI Theming

For Material Design, use Material-UI with its theming solution:

```jsx
// pages/_app.js
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0070f3',
    },
    // ... other theme options
  },
})

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
```

## Best Practices

1. **Consistency**: Use a single theming approach throughout your application.
2. **Responsiveness**: Ensure your theme works well on all device sizes.
3. **Accessibility**: Maintain proper color contrast for readability.
4. **Performance**: Be mindful of the performance impact of your chosen theming method.
5. **Maintainability**: Use variables or design tokens for easy updates.

## Conclusion

Choosing the right theming approach depends on your project requirements, team preferences, and scalability needs. CSS Modules and global styles offer simplicity, CSS-in-JS provides powerful dynamic styling, Tailwind CSS offers utility-first rapid development, and Material-UI gives a complete design system. Consider your needs carefully when selecting a theming strategy for your Next.js application.