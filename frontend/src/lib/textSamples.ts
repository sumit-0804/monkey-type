export type TestMode = 'time' | 'words';
export type CodeLanguage = 'javascript' | 'python' | 'java' | 'cpp' | 'c' | 'go';

const words = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "was", "are", "been", "has", "had", "were", "said", "did", "having",
  "may", "should", "could", "being", "might", "must", "shall", "can", "will", "would",
  "through", "between", "under", "where", "before", "after", "above", "below", "during", "without",
  "against", "among", "throughout", "despite", "towards", "upon", "concerning", "off", "right", "left",
  "program", "system", "computer", "software", "hardware", "network", "internet", "website", "application", "database",
  "function", "variable", "method", "class", "object", "array", "string", "number", "boolean", "return",
  "public", "private", "static", "void", "int", "double", "float", "char", "long", "short",
  "while", "for", "if", "else", "switch", "case", "break", "continue", "return", "try",
  "catch", "throw", "finally", "new", "delete", "this", "super", "extends", "implements", "interface",
  "package", "import", "export", "default", "const", "let", "var", "async", "await", "promise",
];

const punctuationMarks = [",", ".", "!", "?", ";", ":", "'", '"', "-", "(", ")", "[", "]"];
const numberChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function generateText(
  wordCount: number,
  includePunctuation: boolean,
  includeNumbers: boolean
): string {
  const result: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    let word = words[Math.floor(Math.random() * words.length)];

    // Add numbers randomly within words
    if (includeNumbers && Math.random() < 0.2) {
      const numCount = Math.floor(Math.random() * 3) + 1;
      const numberStr = Array.from({ length: numCount }, () =>
        numberChars[Math.floor(Math.random() * numberChars.length)]
      ).join('');
      word = word + numberStr;
    }

    // Add punctuation
    if (includePunctuation) {
      // Capitalize first letter of sentence
      if (i === 0 || (i > 0 && ['.', '!', '?'].some(p => result[i - 1].includes(p)))) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Add punctuation at end of word
      if (Math.random() < 0.15) {
        const punct = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
        word = word + punct;
      } else if ((i + 1) % 10 === 0 && i !== wordCount - 1) {
        // Add period every ~10 words
        word = word + '.';
      }
    }

    result.push(word);
  }

  return result.join(' ');
}

const codeSnippets: Record<CodeLanguage, string[]> = {
  javascript: [
    `function calculateSum(arr) {
  return arr.reduce((acc, num) => acc + num, 0);
}

const numbers = [1, 2, 3, 4, 5];
console.log(calculateSum(numbers));`,

    `const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};`,

    `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }
}`,

    `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((a, b) => a + b, 0);`,
  ],

  python: [
    `def calculate_sum(numbers):
    return sum(numbers)

result = calculate_sum([1, 2, 3, 4, 5])
print(result)`,

    `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof!"`,

    `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))`,

    `import json

with open('data.json', 'r') as f:
    data = json.load(f)
    for item in data:
        print(item)`,
  ],

  java: [
    `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

    `public int findMax(int[] arr) {
    int max = arr[0];
    for (int num : arr) {
        if (num > max) {
            max = num;
        }
    }
    return max;
}`,

    `class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }
}`,

    `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
  ],

  cpp: [
    `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}`,

    `class Rectangle {
private:
    int width, height;
public:
    Rectangle(int w, int h) : width(w), height(h) {}
    int area() { return width * height; }
};`,

    `template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}`,

    `vector<int> nums = {1, 2, 3, 4, 5};
for (auto it = nums.begin(); it != nums.end(); ++it) {
    cout << *it << " ";
}`,
  ],

  c: [
    `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,

    `int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,

    `struct Point {
    int x;
    int y;
};

struct Point createPoint(int x, int y) {
    struct Point p = {x, y};
    return p;
}`,

    `int arr[5] = {1, 2, 3, 4, 5};
for (int i = 0; i < 5; i++) {
    printf("%d ", arr[i]);
}`,
  ],

  go: [
    `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,

    `func calculateSum(numbers []int) int {
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    return sum
}`,

    `type Person struct {
    Name string
    Age  int
}

func NewPerson(name string, age int) *Person {
    return &Person{Name: name, Age: age}
}`,

    `func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}`,
  ],
};

export function getCodeSnippet(language: CodeLanguage): string {
  const snippets = codeSnippets[language];
  return snippets[Math.floor(Math.random() * snippets.length)];
}
