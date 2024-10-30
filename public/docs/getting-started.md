# Getting Started with Yet Another Wiki

Welcome to Yet Another Wiki! This guide will help you get started with setting up and customizing your wiki environment.

## Installation

### Prerequisites

Before you begin, ensure you have:
* Node.js (version 14.0.0 or later)
* npm (comes with Node.js)

### Setting Up Your Environment

1. Create a new Next.js project:
```bash
npx create-next-app@latest my-wiki-project
```

2. During setup, you'll be prompted with several configuration options:
   * TypeScript support (Recommended: Yes)
   * ESLint (Recommended: Yes)
   * Tailwind CSS (Optional)
   * App Router (Recommended: Yes)
   * Custom import alias (Optional)

3. Navigate to your project directory:
```bash
cd my-wiki-project
```

4. Start the development server:
```bash
npm run dev
```

Your wiki should now be running at `http://localhost:3000`

## Project Structure

Key directories in your wiki:
* `app/`: Contains your application's pages and components
* `public/`: Stores static assets
* `styles/`: Houses your CSS files
* `docs/`: Your wiki documentation files

## Theming Your Wiki

### Available Theming Options

1. **CSS Modules**
```jsx
// styles/WikiPage.module.css
.container {
  background-color: var(--primary-color);
  padding: 2rem;
}

// components/WikiPage.js
import styles from '../styles/WikiPage.module.css'

const WikiPage = ({ children }) => (
  <div className={styles.container}>{children}</div>
)
```

2. **Global Styles**
```css
/* styles/globals.css */
:root {
  --primary-color: #0070f3;
  --text-color: #333;
}

[data-theme='dark'] {
  --primary-color: #00a8ff;
  --text-color: #fff;
}
```

3. **Theme Context**
```jsx
// contexts/ThemeContext.js
import React, { createContext, useState } from 'react'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### Customizing Your Theme

1. **Colors**: Modify the color scheme in your CSS variables or theme context
2. **Typography**: Adjust font families and sizes
3. **Layout**: Customize spacing and component arrangements
4. **Dark Mode**: Implement a theme switcher using the theme context

## Best Practices

1. **Organization**
   * Keep related files together
   * Use clear, consistent naming conventions
   * Maintain a logical folder structure

2. **Performance**
   * Optimize images before adding to the wiki
   * Use appropriate image formats
   * Implement lazy loading for large content

3. **Content Management**
   * Regular backups of wiki content
   * Version control for documentation
   * Clear documentation structure

4. **Accessibility**
   * Maintain proper heading hierarchy
   * Ensure sufficient color contrast
   * Provide alt text for images

## Troubleshooting

Common issues and solutions:

1. **Installation Problems**
   * Clear npm cache: `npm cache clean --force`
   * Delete node_modules and reinstall
   * Verify Node.js version compatibility

2. **Styling Issues**
   * Check CSS module imports
   * Verify theme context implementation
   * Inspect browser dev tools for conflicts

3. **Content Display**
   * Verify markdown syntax
   * Check file permissions
   * Ensure proper file extensions

## Next Steps

1. Explore the documentation structure
2. Customize your wiki theme
3. Add your first wiki pages
4. Set up collaboration workflows

## Additional Resources

* [Next.js Documentation](https://nextjs.org/docs)
* [Markdown Guide](https://www.markdownguide.org)
* [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

Remember to regularly update your wiki content and maintain consistent styling throughout your documentation. Happy wiki building!
