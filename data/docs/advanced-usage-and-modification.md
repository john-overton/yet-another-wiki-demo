# Advanced Usage and Modification

A detailed guide to extending and customizing Yet Another Wiki's architecture.

## Styling Framework 🎨

Yet Another Wiki uses a powerful combination of Tailwind CSS and Bootstrap:

### Dual Framework Integration

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
@import "/bootstrap/scss/bootstrap/bootstrap.scss";
```

This unique setup provides:
- Tailwind's utility-first approach
- Bootstrap's component library
- Custom CSS variables for theming
- Responsive design utilities from both frameworks

### CSS Variable System

```css
:root {
  --background: #ffffff;
  --color-primary: #076bf8;
  --color-primary-hover: #0555c7;
  --color-background-light: #f6f6f6;
  --color-input-border: #374151;
  --color-text-gray: #374151;
  /* ... other variables */
}

.dark {
  --background: #111827;
  --color-primary: #3b82f6;
  /* ... dark theme variables */
}
```

These variables control:
- Color schemes
- Theme switching
- Component appearances
- Animation properties

## Extending the Wiki 🔧

### Custom Page Types

Create specialized page templates:

```jsx
// app/components/CustomPageTemplate.js
import { MarkdownRenderer } from './MarkdownRenderer';

export function CustomPageTemplate({ content, metadata }) {
  return (
    <div className="custom-page">
      <div className="custom-header bg-primary p-4">
        <h1>{metadata.title}</h1>
        {metadata.tags && (
          <div className="tags">
            {metadata.tags.map(tag => (
              <span key={tag} className="badge bg-secondary">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <MarkdownRenderer content={content} />
    </div>
  );
}
```

### Custom Components

Add specialized wiki components:

```jsx
// app/components/WikiDiagram.js
export function WikiDiagram({ data }) {
  return (
    <div className="wiki-diagram border rounded-lg p-4">
      <div className="diagram-header flex justify-between">
        <h3 className="text-lg font-semibold">{data.title}</h3>
        <div className="controls">
          <button className="btn btn-sm btn-primary">
            <i className="ri-zoom-in-line"></i>
          </button>
        </div>
      </div>
      {/* Diagram rendering logic */}
    </div>
  );
}
```

### Custom Markdown Extensions

Extend markdown capabilities:

```jsx
// app/components/CustomMarkdownExtensions.js
const customComponents = {
  InfoBox: ({ children, type = 'info' }) => (
    <div className={`wiki-info-box ${type} p-4 rounded-lg mb-4
      ${type === 'warning' ? 'bg-yellow-100 border-yellow-500' : 
      type === 'error' ? 'bg-red-100 border-red-500' : 
      'bg-blue-100 border-blue-500'}`}>
      {children}
    </div>
  ),
  
  CodePreview: ({ code, language }) => (
    <div className="code-preview border rounded-lg overflow-hidden">
      <div className="preview-header bg-gray-100 p-2 flex justify-between">
        <span className="text-sm text-gray-600">{language}</span>
        <button onClick={() => navigator.clipboard.writeText(code)}>
          <i className="ri-clipboard-line"></i>
        </button>
      </div>
      <pre className={`language-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  )
};
```

## Real-World Customization Examples 🎯

### Custom Landing Page

```jsx
// app/custom/landing.js
export default function CustomLanding() {
  return (
    <div className="landing-page min-h-screen">
      <header className="bg-gradient-to-r from-primary to-primary-dark">
        <nav className="container mx-auto px-4 py-6">
          {/* Custom navigation */}
        </nav>
        <div className="hero-section container mx-auto px-4 py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Your Custom Wiki
          </h1>
          {/* Hero content */}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature sections */}
        </div>
      </main>
    </div>
  );
}
```

### Custom Search Implementation

```jsx
// app/components/AdvancedSearch.js
export function AdvancedSearch() {
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'any',
    tags: []
  });

  return (
    <div className="advanced-search border rounded-lg p-4">
      <div className="search-header flex items-center gap-4">
        <input 
          type="text" 
          className="form-control flex-grow"
          placeholder="Search wiki..."
        />
        <div className="filter-buttons flex gap-2">
          <button className="btn btn-outline-secondary">
            <i className="ri-filter-line"></i>
          </button>
          <button className="btn btn-outline-secondary">
            <i className="ri-sort-desc"></i>
          </button>
        </div>
      </div>
      
      {/* Advanced filters */}
      <div className="filters mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filter components */}
      </div>
    </div>
  );
}
```

### Custom Theme Implementation

```javascript
// themes/custom-theme.js
export const customTheme = {
  name: 'Custom Theme',
  colors: {
    primary: {
      light: '#7C3AED',
      DEFAULT: '#5B21B6',
      dark: '#4C1D95'
    },
    secondary: {
      light: '#10B981',
      DEFAULT: '#059669',
      dark: '#047857'
    }
  },
  typography: {
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace']
    },
    sizes: {
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  },
  components: {
    // Custom component styles
    Button: {
      base: 'rounded-lg font-medium transition-colors',
      variants: {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark'
      }
    }
  }
};
```

## Integration Points 🔌

### Custom API Endpoints

```javascript
// app/api/custom/stats/route.js
export async function GET(request) {
  const stats = await generateWikiStats();
  return new Response(JSON.stringify({
    totalPages: stats.pageCount,
    totalEdits: stats.editCount,
    activeUsers: stats.activeUsers,
    topContributors: stats.topContributors
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Custom Authentication

```javascript
// app/auth/CustomAuthProvider.js
export const CustomAuthProvider = {
  id: 'custom',
  name: 'Custom Auth',
  type: 'credentials',
  
  async authorize(credentials) {
    // Custom authentication logic
    const user = await validateCustomCredentials(credentials);
    return user;
  },
  
  async session({ session, token }) {
    // Custom session handling
    return {
      ...session,
      customData: token.customData
    };
  }
};
```

## Styling Best Practices 🎯

### Combining Frameworks

1. **Use Tailwind for Layout**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

2. **Use Bootstrap for Components**:
```jsx
<button className="btn btn-primary">
  Action
</button>
```

3. **Custom Utilities**:
```css
@layer utilities {
  .wiki-gradient {
    @apply bg-gradient-to-r from-primary to-primary-dark;
  }
}
```

### Theme Integration

```javascript
// app/hooks/useWikiTheme.js
export function useWikiTheme() {
  const [theme, setTheme] = useState(defaultTheme);
  
  const updateTheme = (newTheme) => {
    // Update CSS variables
    Object.entries(newTheme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--color-${key}`,
        value
      );
    });
    setTheme(newTheme);
  };
  
  return { theme, updateTheme };
}
```

## Performance Considerations 🚀

### Optimization Techniques

1. **Component Code Splitting**:
```javascript
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
});
```

2. **Image Optimization**:
```jsx
<Image
  src="/wiki-image.jpg"
  width={800}
  height={600}
  placeholder="blur"
  priority={isHero}
  alt="Wiki Image"
/>
```

3. **API Route Optimization**:
```javascript
export const config = {
  runtime: 'edge',
  regions: ['sfo1', 'iad1'],
};
```

:::tip
Always test custom components with both light and dark themes to ensure proper contrast and visibility.
:::

:::warning
Custom components should maintain the wiki's accessibility standards and responsive design principles.
:::

## Related Documentation 📚

- [Tailwind Configuration](theming.md)
- [Component Guidelines](components.md)
- [API Integration](api-integration.md)
