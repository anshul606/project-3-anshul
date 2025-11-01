import { useState } from "react";
import CodeDisplay from "./CodeDisplay";
import { SUPPORTED_LANGUAGES } from "../../utils/languageDetector";

/**
 * Demo component to showcase CodeDisplay functionality
 * This component demonstrates syntax highlighting for various languages
 */
const CodeDisplayDemo = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  const codeExamples = {
    javascript: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci(10):', result);`,

    python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
print(f'Fibonacci(10): {result}')`,

    java: `public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        int result = fibonacci(10);
        System.out.println("Fibonacci(10): " + result);
    }
}`,

    cpp: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int result = fibonacci(10);
    cout << "Fibonacci(10): " << result << endl;
    return 0;
}`,

    go: `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    result := fibonacci(10)
    fmt.Printf("Fibonacci(10): %d\\n", result)
}`,

    rust: `fn fibonacci(n: u32) -> u32 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    let result = fibonacci(10);
    println!("Fibonacci(10): {}", result);
}`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Snippet Manager</title>
</head>
<body>
    <h1>Welcome to Code Snippet Manager</h1>
    <p>Store and organize your code snippets efficiently.</p>
</body>
</html>`,

    css: `.code-display {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}

.code-display code {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
}`,

    sql: `SELECT 
    u.id,
    u.username,
    COUNT(s.id) as snippet_count
FROM users u
LEFT JOIN snippets s ON u.id = s.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.username
ORDER BY snippet_count DESC
LIMIT 10;`,

    json: `{
  "name": "code-snippet-manager",
  "version": "1.0.0",
  "description": "A web-based code snippet manager",
  "features": [
    "Syntax highlighting",
    "Search and filter",
    "Collections",
    "Sharing"
  ],
  "languages": {
    "supported": 20,
    "autoDetect": true
  }
}`,
  };

  const currentCode = codeExamples[selectedLanguage] || codeExamples.javascript;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Code Display Demo</h2>

      <div className="mb-4 flex gap-4 items-center">
        <div className="flex-1">
          <label
            htmlFor="language-select"
            className="block text-sm font-medium mb-2"
          >
            Select Language:
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.filter((lang) => codeExamples[lang.value]).map(
              (lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="line-numbers"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="line-numbers" className="text-sm font-medium">
            Show Line Numbers
          </label>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <CodeDisplay
          code={currentCode}
          language={selectedLanguage}
          showLineNumbers={showLineNumbers}
        />
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Automatic syntax highlighting for 20+ languages</li>
          <li>Auto-detection when language is not specified</li>
          <li>Fallback to plain text when detection fails</li>
          <li>Optional line numbers display</li>
          <li>Dark theme compatible styling</li>
        </ul>
      </div>
    </div>
  );
};

export default CodeDisplayDemo;
