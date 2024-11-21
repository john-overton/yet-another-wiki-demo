# Importing Pages

Learn how to import existing markdown files into Yet Another Wiki.

## Import Feature Overview 📥

The import feature allows you to add existing markdown (.md) files to your wiki. You can access this feature through the "Import Page" button located at the bottom of the sidebar.

## Import Process 🔄

### Accessing the Import Modal

1. Look for the "Import Page" button in the sidebar footer
2. Click the button to open the import modal
3. The modal provides options for file selection and import location

### Selecting Files 📁

To import a markdown file:

1. Click "Select File" or browse button
2. Choose a markdown (.md) file from your computer
3. Only `.md` files are supported
4. File size should be reasonable for web upload

:::caution
Make sure your markdown file is properly formatted to ensure successful import.
:::

### Choosing Import Location 📍

You can specify where to place the imported page:

1. **Root Level**: Select "Root (Top Level)" to place the page at the top of your wiki
2. **Under Existing Page**: Choose any existing page as the parent
3. The dropdown shows all available pages in your wiki

:::tip
Choose a location that makes sense for your wiki's structure. You can always move the page later using the sidebar.
:::

## Import Rules and Limitations ⚠️

### Supported Content

- Markdown (.md) files only
- Standard markdown syntax
- Images referenced in the markdown (will need separate handling)
- Links to other pages

### File Requirements

1. Must have a `.md` extension
2. Should contain valid markdown content
3. File name will be used as initial page title
4. Content should be UTF-8 encoded

## Best Practices 💡

### Before Importing

1. **Review Content**:
   - Check markdown formatting
   - Verify all content is included
   - Ensure images are properly referenced

2. **Choose Location**:
   - Plan your wiki structure
   - Select appropriate parent pages
   - Consider content organization

3. **File Preparation**:
   - Use clear, descriptive filenames
   - Clean up unnecessary formatting
   - Remove any broken references

### After Import

1. **Verify Content**:
   - Check the imported page renders correctly
   - Verify all sections are present
   - Test any internal links

2. **Organize**:
   - Adjust the page title if needed
   - Set appropriate visibility
   - Update sort order if necessary

## Troubleshooting 🔧

### Common Issues

1. **File Not Importing**:
   - Verify file is `.md` format
   - Check file size
   - Ensure content is valid markdown

2. **Content Not Displaying**:
   - Check markdown syntax
   - Look for special characters
   - Verify encoding is correct

3. **Images Not Showing**:
   - Update image references
   - Import images separately
   - Use relative paths when possible

:::info
If your import fails, try viewing the markdown file in a text editor to check for any formatting issues.
:::

## Tips for Success 🎯

1. **Organization**:
   - Import related content together
   - Maintain consistent structure
   - Use meaningful page names

2. **Content Check**:
   - Preview content before importing
   - Test all links and references
   - Verify formatting is preserved

3. **Post-Import**:
   - Review imported content
   - Update navigation structure
   - Add any missing metadata

:::tip
For large imports, consider breaking content into smaller files and importing them separately to make management easier.
:::

## Keyboard Navigation ⌨️

In the import modal:
- `Tab`: Navigate between fields
- `Space/Enter`: Select file or confirm import
- `Esc`: Close modal

:::info
Remember that you can always edit the imported content after import using the standard page editor.
:::
