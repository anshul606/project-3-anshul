# Syntax Highlighting Implementation

## Overview

This implementation provides syntax highlighting for code snippets using highlight.js library. It supports 20+ programming languages with automatic language detection and fallback to plain text when detection fails.

## Components

### 1. CodeDisplay Component (`CodeDisplay.jsx`)

The main component for displaying code with syntax highlighting.

**Features:**

- Automatic syntax highlighting using highlight.js
- Support for 20+ programming languages
- Optional line numbers display
- Auto-detection when language is not specified
- Graceful fallback to plain text on errors
- Dark theme compatible (github-dark theme)

**Usage:**

```jsx
import { CodeDisplay } from './components/snippets';

// With explicit language
<CodeDisplay
  code="const x = 10;"
  language="javascript"
/>

// With auto-detection
<CodeDisplay
  code="def hello(): print('Hi')"
  language="auto"
/>

// With line numbers
<CodeDisplay
  code="function test() { return true; }"
  language="javascript"
  showLineNumbers={true}
/>
```

### 2. Language Detector Utility (`languageDetector.js`)

Provides language detection and validation utilities.

**Functions:**

- `detectLanguage(code)` - Auto-detects programming language from code
- `isLanguageSupported(language)` - Checks if a language is supported
- `getLanguageLabel(language)` - Gets display label for a language
- `SUPPORTED_LANGUAGES` - Array of all supported languages

**Supported Languages (24 total):**

- JavaScript, TypeScript
- Python, Java, C++, C, C#
- Go, Rust, PHP, Ruby, Swift, Kotlin
- HTML, CSS, SCSS
- SQL, Bash, Shell
- JSON, XML, YAML, Markdown
- Plain Text

## Implementation Details

### Syntax Highlighting Process

1. **Language Determination:**

   - If language is explicitly provided, use it
   - If language is "auto" or not provided, use `detectLanguage()`
   - Fallback to "plaintext" if detection fails

2. **Highlighting:**

   - Use `hljs.highlight()` with the determined language
   - Apply syntax highlighting to code element via innerHTML
   - Handle errors gracefully with plain text fallback

3. **Styling:**
   - Uses github-dark theme from highlight.js
   - Custom CSS for line numbers and container styling
   - Compatible with light and dark modes

### Auto-Detection Limitations

Auto-detection works best with:

- Longer code snippets (5+ lines)
- Code with distinctive syntax features
- Well-formatted code

Auto-detection may be unreliable for:

- Very short snippets (1-2 lines)
- Generic code without language-specific keywords
- Ambiguous syntax

**Recommendation:** Always specify the language explicitly when possible for best results.

### Performance Considerations

- Syntax highlighting is applied on component mount and when code/language changes
- Uses `useEffect` hook to minimize re-renders
- Line numbers are rendered separately to avoid re-highlighting

## Testing

Tests are located in `src/utils/languageDetector.test.js`

Run tests:

```bash
npm test -- src/utils/languageDetector.test.js
```

## Integration with SnippetEditor

The SnippetEditor component uses the centralized `SUPPORTED_LANGUAGES` constant for its language selector dropdown, ensuring consistency across the application.

## Future Enhancements

Potential improvements:

- Add more themes (light mode option)
- Support for custom themes
- Copy button integration
- Code folding for long snippets
- Syntax error highlighting
- Line highlighting for specific lines
