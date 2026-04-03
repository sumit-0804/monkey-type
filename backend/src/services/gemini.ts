import { GoogleGenAI } from "@google/genai";
import { enqueue } from "./requestQueue";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MODEL = "gemini-3.1-flash-lite-preview";

// --- Fallback code snippets per language ---
const fallbackCodeSnippets: Record<string, string[]> = {
  javascript: [
    `function calculateSum(arr) {\n    return arr.reduce((acc, num) => acc + num, 0);\n}\n\nconst numbers = [1, 2, 3, 4, 5];\nconsole.log(calculateSum(numbers));`,
    `const fetchData = async (url) => {\n    try {\n        const response = await fetch(url);\n        const data = await response.json();\n        return data;\n    } catch (error) {\n        console.error('Error:', error);\n    }\n};`,
    `function fibonacci(n) {\n    if (n <= 1) return n;\n    let a = 0, b = 1;\n    for (let i = 2; i <= n; i++) {\n        [a, b] = [b, a + b];\n    }\n    return b;\n}`,
  ],
  python: [
    `def calculate_sum(numbers):\n    return sum(numbers)\n\nresult = calculate_sum([1, 2, 3, 4, 5])\nprint(result)`,
    `class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        pass\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"`,
    `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint(fibonacci(10))`,
  ],
  java: [
    `public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    `public class Calculator {\n    public static int add(int a, int b) {\n        return a + b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(add(3, 5));\n    }\n}`,
  ],
  cpp: [
    `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}`,
    `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for (int n : nums) {\n        sum += n;\n    }\n    cout << "Sum: " << sum << endl;\n    return 0;\n}`,
  ],
  go: [
    `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
    `package main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n    if n <= 1 {\n        return n\n    }\n    a, b := 0, 1\n    for i := 2; i <= n; i++ {\n        a, b = b, a+b\n    }\n    return b\n}\n\nfunc main() {\n    fmt.Println(fibonacci(10))\n}`,
  ],
};

export function getFallbackCode(language: string): string {
  const snippets = fallbackCodeSnippets[language] ?? fallbackCodeSnippets.javascript ?? [];
  return snippets[Math.floor(Math.random() * snippets.length)] ?? "console.log('hello');";
}

/**
 * Raw Gemini API call — no rate limiting.
 * This is wrapped by the request queue.
 */
async function callGemini(prompt: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
        responseMimeType: "application/json",
    }
  });
  return (result as any).text.trim();
}

/**
 * Generate multiple code snippets in a single batch — goes through the global request queue.
 * Returns null if the queue rejects it (full) or API fails.
 */
export async function generateBatchCodeSnippets(language: string): Promise<string[] | null> {
  const prompt = `Generate 10 different, realistic ${language} code snippets.
    Rules:
    - Use 4 spaces for each level of indentation.
    - Include proper newlines between statements.
    - Be syntactically correct and provide complete, functional-looking logic blocks.
    - Do not worry about word count; provide the full necessary code for the pattern.
    - Return a JSON array of strings.`;

  const result = await enqueue(async () => {
    const text = await callGemini(prompt);
    return text;
  });

  if (!result) return null;

  try {
    const snippets = JSON.parse(result) as string[];
    return snippets;
  } catch (error) {
    console.error("Failed to parse batch JSON response:", error);
    return null;
  }
}
