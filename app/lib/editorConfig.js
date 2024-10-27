import { config } from 'md-editor-rt';

// Configure the editor globally
config({
  // Configure markdown-it for better markdown parsing
  markdownItConfig(mdit) {
    // Enable line breaks with single newline
    mdit.set({ breaks: true });
    // Enable GitHub-flavored markdown features
    mdit.use(require('markdown-it-task-lists'));
    mdit.use(require('markdown-it-sub'));
    mdit.use(require('markdown-it-sup'));
  },

  // Configure editor settings
  editorConfig: {
    // Set rendering delay for better performance
    renderDelay: 300,
    // Configure z-index for modals
    zIndex: 1000
  },

  // Configure editor extensions
  editorExtensions: {
    highlight: {
      // Use CDN for highlight.js themes
      css: {
        atom: {
          light: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-light.min.css',
          dark: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css'
        }
      }
    },
    // Configure katex for math formulas
    katex: {
      js: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js',
      css: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css'
    },
    // Configure mermaid for diagrams
    mermaid: {
      js: 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.0/mermaid.min.js'
    }
  },

  // Configure mermaid settings
  mermaidConfig(base) {
    return {
      ...base,
      theme: 'neutral',
      securityLevel: 'loose'
    };
  },

  // Configure katex settings
  katexConfig(base) {
    return {
      ...base,
      throwOnError: false,
      strict: false
    };
  },

  // Configure code mirror extensions
  codeMirrorExtensions(theme, extensions) {
    // Add line numbers to the editor
    const { lineNumbers } = require('@codemirror/view');
    return [...extensions, lineNumbers()];
  }
});
