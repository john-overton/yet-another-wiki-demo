# Editing a Page in Yet Another Wiki

This guide covers all aspects of editing pages, from basic formatting to advanced features.

## Editor Interface 📝

The page editor provides a rich editing experience with several key sections:

### Page Details Section

At the top of the editor, you'll find the Page Details panel:

- **Page Title**: The display name of your page
- **URL Slug**: The URL-friendly version of your title
- **Visibility Toggle**: Switch between public and private access
- **Sort Order**: Arrange pages in the sidebar hierarchy

### Toolbar Features

The editor includes a comprehensive toolbar with:

#### Text Formatting
- Bold, Italic, Underline
- Strikethrough
- Headings (H1-H6)
- Lists (Bulleted and Numbered)
- Blockquotes

#### Insert Options
- Links
- Images (with drag-and-drop support)
- Tables
- Code blocks
- Thematic breaks (horizontal rules)
- Admonitions (note, tip, warning, etc.)

#### Advanced Features
- Undo/Redo
- Source/Preview toggle
- Code syntax highlighting
- Table of contents generation

## Editing Features 🛠️

### Basic Formatting

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold Text**
*Italic Text*
~~Strikethrough~~

- Bullet list
- With items
  - And sub-items

1. Numbered list
2. Auto-numbered
```

### Code Blocks

The editor supports syntax highlighting for multiple languages:

```javascript
// Example code block
function hello() {
    console.log("Hello, World!");
}
```

Supported languages include:
- JavaScript/TypeScript
- Python
- HTML/CSS
- SQL
- And many more...

### Admonitions

Special callout blocks for important information:

```markdown
:::note
Important information here
:::

:::tip
Helpful tips
:::

:::warning
Warning message
:::
```

### Tables

Create structured data with tables:

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

## Page Settings ⚙️

### Title and URL

- **Page Title**: Used for display in the sidebar and content
- **URL Slug**: Automatically generated but can be customized
  - Use lowercase letters, numbers, and hyphens
  - Affects the page's URL structure

### Visibility Settings

Toggle between:
- **Public**: Visible to all users
- **Private**: Only visible to authenticated users

### Sort Order

Control page hierarchy in the sidebar:
1. Open the Sort Order panel
2. Drag pages to reorder
3. Nest pages under others for hierarchy
4. Changes are saved automatically

## Working with Images 🖼️

### Image Upload

Two ways to add images:
1. Use the image button in the toolbar
2. Drag and drop images directly into the editor

Images are automatically:
- Uploaded to the server
- Optimized for web display
- Inserted with proper markdown syntax

## Preview Mode 👁️

Toggle between:
- **Edit Mode**: Full editor interface
- **Preview Mode**: See the final rendered output
- **Source Mode**: View/edit raw markdown

## Keyboard Shortcuts ⌨️

Common shortcuts for efficient editing:

- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + K`: Insert link
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo

## Saving Changes 💾

### Auto-save Features

- Changes are tracked automatically
- Unsaved changes warning when navigating away
- Version history maintained

### Manual Save

Use the save button to:
- Commit all changes
- Update page metadata
- Refresh the sidebar structure

:::tip
Always preview your changes before saving to ensure proper formatting and layout.
:::

:::info
Sort order changes are saved separately from content changes and take effect immediately.
:::

## Best Practices 💡

1. **Structure**:
   - Use headings for clear organization
   - Maintain a logical hierarchy
   - Keep URLs clean and meaningful

2. **Content**:
   - Use appropriate formatting for different content types
   - Include descriptive alt text for images
   - Break up long content with headings and lists

3. **Organization**:
   - Use sort order to create logical page groupings
   - Keep related content together
   - Maintain consistent naming conventions

:::tip
Remember to use the preview mode frequently to ensure your content looks as intended.
:::
