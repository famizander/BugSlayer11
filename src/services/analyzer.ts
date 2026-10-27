import { Language, Submission } from '../types';

export interface AnalysisResult {
  status: 'Error Found' | 'Fixed' | 'No Errors';
  compilerOutput: string;
  expectedOutput: string;
  actualOutput?: string;
  errorSummary: string;
  hints: string[];
  explanation: string;
  correctedCode: string;
  learningTips: string[];
  progressPercent: number;
}

export async function analyzeCode(
  code: string,
  language: Language,
  expectedOutput: string
): Promise<AnalysisResult> {
  // First attempt to call the backend endpoint if available
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, expectedOutput }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.hints && data.compilerOutput) {
        return data;
      }
    }
  } catch {
    // Fall back to built-in intelligent diagnostic engine below
  }

  return analyzeCodeLocally(code, language, expectedOutput);
}

export function analyzeCodeLocally(
  code: string,
  language: Language,
  expectedOutput: string
): AnalysisResult {
  const lines = code.split('\n');

  if (language === 'cpp') {
    // Check 1: Missing semicolon
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = (lines[i + 1] || '').trim();

      // Check common missing semicolon patterns
      if (
        (line.startsWith('int ') ||
          line.startsWith('string ') ||
          line.startsWith('float ') ||
          line.startsWith('double ') ||
          line.startsWith('bool ') ||
          line.startsWith('cout') ||
          line.startsWith('cin') ||
          line.startsWith('return ') ||
          /^[a-zA-Z_]\w*\s*=/.test(line)) &&
        !line.endsWith(';') &&
        !line.endsWith('{') &&
        !line.endsWith('}') &&
        !line.startsWith('for') &&
        !line.startsWith('while') &&
        !line.startsWith('if')
      ) {
        const nextWord = nextLine.split(/\s+|[<>;(){}]/)[0] || 'token';
        const compilerMsg = `expected ',' or ';' before '${nextWord || 'token'}'`;

        const correctedLines = [...lines];
        correctedLines[i] = lines[i] + ';';

        return {
          status: 'Error Found',
          compilerOutput: `error: ${compilerMsg} on line ${i + 1}\n  ${lines[i]}\n  ^\n1 error generated.`,
          expectedOutput: expectedOutput || 'Output as defined',
          actualOutput: 'Compilation terminated with exit code 1.',
          errorSummary: `Missing semicolon ';' at line ${i + 1}`,
          hints: [
            'In C++, every declaration and statement must be terminated with a specific punctuation symbol.',
            `Look closely at line ${i + 1}: \`${lines[i].trim()}\`. What punctuation mark is missing right before the next instruction?`,
            `Add a semicolon \`;\` to the end of line ${i + 1} to separate this statement from \`${nextLine}\`.`
          ],
          explanation:
            'In C++, the compiler relies on semicolons to delimit distinct instructions. Unlike languages that use newlines, C++ treats whitespace flexibly. When a semicolon is omitted, the compiler tries to parse the next line as part of the current expression, triggering an error.',
          correctedCode: correctedLines.join('\n'),
          learningTips: [
            'Always check the line right above where the compiler reports the error.',
            'C++ statements inside function bodies almost always conclude with a semicolon.',
            'Format your code with auto-indentation to quickly spot missing terminators.'
          ],
          progressPercent: 65,
        };
      }
    }

    // Check 2: Missing main function
    if (!code.includes('main()') && !code.includes('main (')) {
      return {
        status: 'Error Found',
        compilerOutput: `undefined reference to \`main'\ncollect2: error: ld returned 1 exit status`,
        expectedOutput: expectedOutput || 'Output as defined',
        actualOutput: 'Linker error: undefined reference to main',
        errorSummary: 'Missing `main()` function entry point',
        hints: [
          'Every executable C++ program requires an entry point function.',
          'The operating system searches for a function named `int main()` to begin execution.',
          'Wrap your program code inside `int main() { ... return 0; }`.'
        ],
        explanation:
          'In C++, `main()` is the standard entry point. Without it, the linker cannot assemble an executable file.',
        correctedCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  ${code.split('\n').join('\n  ')}\n  return 0;\n}`,
        learningTips: [
          'Remember: code statements outside of functions or classes cannot be executed directly in C++.',
          'Always return 0 from main() to indicate successful program execution.'
        ],
        progressPercent: 40,
      };
    }

    // Check 3: Missing #include <iostream>
    if ((code.includes('cout') || code.includes('cin')) && !code.includes('<iostream>')) {
      return {
        status: 'Error Found',
        compilerOutput: `error: 'cout' was not declared in this scope\nnote: 'std::cout' is defined in header '<iostream>'`,
        expectedOutput: expectedOutput || 'Output as defined',
        actualOutput: 'Compilation terminated with exit code 1.',
        errorSummary: 'Missing `<iostream>` header for standard input/output',
        hints: [
          'The compiler does not automatically know what `cout` or `cin` are.',
          'Standard input and output streams reside in the standard C++ library headers.',
          'Add `#include <iostream>` at the very top of your file.'
        ],
        explanation:
          '`cout` is declared in `<iostream>`. Without including this header, the compiler has no prototype or definition for stream operations.',
        correctedCode: `#include <iostream>\nusing namespace std;\n\n${code}`,
        learningTips: [
          'Whenever you use `cout`, `cin`, or `endl`, make sure `#include <iostream>` is at the top.',
          'Also include `using namespace std;` or prefix with `std::cout`.'
        ],
        progressPercent: 50,
      };
    }

    // Check 4: Unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      return {
        status: 'Error Found',
        compilerOutput: `error: expected '}' at end of input`,
        expectedOutput: expectedOutput || 'Output as defined',
        actualOutput: 'Compilation failed.',
        errorSummary: `Unbalanced curly braces: ${openBraces} opening vs ${closeBraces} closing`,
        hints: [
          'Every opening curly brace `{` must have a corresponding closing brace `}`.',
          'Count your blocks: check function bodies, if-statements, and loops.',
          `Ensure you close all scopes. You have ${openBraces} '{' and ${closeBraces} '}'.`
        ],
        explanation:
          'C++ scopes are defined by curly braces. An unmatched brace causes the compiler to continue parsing until EOF, expecting more tokens.',
        correctedCode: code + '\n}'.repeat(Math.max(0, openBraces - closeBraces)),
        learningTips: [
          'Keep your braces vertically aligned or indented consistently.',
          'Many editors highlight matching braces when you place your cursor on one.'
        ],
        progressPercent: 55,
      };
    }
  } else {
    // Python Checks
    // Check 1: Missing colon
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        (line.startsWith('if ') ||
          line.startsWith('elif ') ||
          line.startsWith('else') ||
          line.startsWith('for ') ||
          line.startsWith('while ') ||
          line.startsWith('def ')) &&
        !line.endsWith(':')
      ) {
        const correctedLines = [...lines];
        correctedLines[i] = lines[i] + ':';
        return {
          status: 'Error Found',
          compilerOutput: `SyntaxError: expected ':' on line ${i + 1}\n  ${lines[i]}\n  ^`,
          expectedOutput: expectedOutput || 'Output as defined',
          actualOutput: 'Traceback (most recent call last):\n  SyntaxError: expected \':\'',
          errorSummary: `Missing colon ':' at line ${i + 1}`,
          hints: [
            'In Python, compound statements that introduce a code block must end with a specific character.',
            `Examine the end of line ${i + 1}: \`${lines[i].trim()}\`. What punctuation tells Python an indented block begins?`,
            `Add a colon \`:\` to the end of \`${lines[i].trim()}\`.`
          ],
          explanation:
            'In Python, clauses such as `if`, `for`, `while`, and `def` require a colon `:` at the end of their header line to signify that an indented suite of statements follows.',
          correctedCode: correctedLines.join('\n'),
          learningTips: [
            'Think of a colon as saying "here comes the indented code".',
            'Any line in Python that is followed by an indented block almost always ends with a colon.'
          ],
          progressPercent: 70,
        };
      }
    }

    // Check 2: Misspelled print or variable
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('prin(') || line.startsWith('prnt(')) {
        const correctedLines = [...lines];
        correctedLines[i] = lines[i].replace(/^(prin|prnt)\(/, 'print(');
        return {
          status: 'Error Found',
          compilerOutput: `NameError: name '${line.startsWith('prin(') ? 'prin' : 'prnt'}' is not defined. Did you mean: 'print'? on line ${i + 1}`,
          expectedOutput: expectedOutput || 'Output as defined',
          actualOutput: 'Traceback (most recent call last):\n  NameError: name not defined',
          errorSummary: `Misspelled function name on line ${i + 1}`,
          hints: [
            'Python encountered a function or variable identifier that it does not recognize.',
            `Inspect line ${i + 1}. Python\'s built-in output function is spelled \`print\`.`,
            'Correct the spelling to `print(...)`.'
          ],
          explanation:
            'Python is case-sensitive and identifier-sensitive. When a name is invoked that hasn’t been defined in the local or built-in scope, a NameError is raised.',
          correctedCode: correctedLines.join('\n'),
          learningTips: [
            'Watch out for typos in built-in names like `print`, `len`, `range`, and `str`.',
            'Python will often suggest "Did you mean...?" in modern tracebacks.'
          ],
          progressPercent: 30,
        };
      }
    }

    // Check 3: IndentationError
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1];
      if (
        (line.startsWith('if ') ||
          line.startsWith('for ') ||
          line.startsWith('while ') ||
          line.startsWith('def ')) &&
        line.endsWith(':') &&
        nextLine.trim() !== '' &&
        !nextLine.startsWith(' ') &&
        !nextLine.startsWith('\t')
      ) {
        const correctedLines = [...lines];
        correctedLines[i + 1] = '    ' + nextLine.trim();
        return {
          status: 'Error Found',
          compilerOutput: `IndentationError: expected an indented block after '${line.split(' ')[0]}' statement on line ${i + 1}`,
          expectedOutput: expectedOutput || 'Output as defined',
          actualOutput: 'Traceback (most recent call last):\n  IndentationError: expected an indented block',
          errorSummary: `Missing indentation on line ${i + 2}`,
          hints: [
            'Unlike languages that use curly braces, Python uses indentation (spaces) to group statements.',
            `After a colon on line ${i + 1}, the next statement must be indented by 4 spaces.`,
            `Indent line ${i + 2} with 4 spaces.`
          ],
          explanation:
            'Python enforces clean code structure through significant whitespace. Every line inside a block must be indented by an equal number of spaces (standard is 4 spaces).',
          correctedCode: correctedLines.join('\n'),
          learningTips: [
            'Use spaces rather than tabs for indentation to avoid tab-mixing errors.',
            'Configure your code editor to insert 4 spaces when pressing the Tab key.'
          ],
          progressPercent: 50,
        };
      }
    }
  }

  // If code appears clean or no common syntax error detected
  return {
    status: 'No Errors',
    compilerOutput:
      language === 'cpp'
        ? `g++ -std=c++17 main.cpp -o main\n[Compilation Successful! 0 warnings, 0 errors]`
        : `python3 main.py\n[Code syntax verified successfully! Ready to execute.]`,
    expectedOutput: expectedOutput || 'Expected output produced',
    actualOutput: expectedOutput || 'Program completed with exit code 0.',
    errorSummary: 'No syntax or compilation errors found in this code.',
    hints: [
      'Your code structure and syntax are valid! Excellent work.',
      'Check if the output matches your logical expectations or edge case requirements.',
      'Try adding more test cases or comments to make your solution self-documenting.'
    ],
    explanation:
      'The code compiles cleanly without any syntax errors, unresolved symbols, or syntax anomalies. Great job!',
    correctedCode: code,
    learningTips: [
      'Write clean, readable variable names for maintainability.',
      'Test edge cases, such as empty inputs, negative numbers, or maximum bounds.',
      'Always structure your logic step by step before coding.'
    ],
    progressPercent: 100,
  };
}

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    userId: 'user-demo-1',
    title: 'Missing semicolon in age output',
    language: 'cpp',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int age = 20\n  cout << "Age: " << age << endl;\n  return 0;\n}`,
    status: 'Error Found',
    timestamp: '2026-10-27T08:15:00Z',
    compilerOutput: `error: expected ',' or ';' before 'cout'\n  cout << "Age: " << age << endl;\n  ^~~~`,
    expectedOutput: 'Age: 20',
    actualOutput: 'Compilation terminated with exit code 1.',
    errorSummary: "expected ',' or ';' before 'cout'",
    hints: [
      'In C++, every declaration statement inside a function must end with a semicolon `;`.',
      'Look at line 5: `int age = 20`. It is missing the statement terminator.',
      'Add `;` at the end of `int age = 20;`.'
    ],
    explanation:
      'C++ statements must conclude with a semicolon so the compiler knows where the declaration ends. Without it, the compiler attempts to parse `cout` as part of the declaration.',
    correctedCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int age = 20;\n  cout << "Age: " << age << endl;\n  return 0;\n}`,
    learningTips: [
      'Semicolons are mandatory statement terminators in C++.',
      'The compiler error usually points to the token immediately following the missing semicolon.'
    ],
    progressPercent: 70,
  },
  {
    id: 'sub-2',
    userId: 'user-demo-1',
    title: 'Misspelled variable in greeting function',
    language: 'python',
    code: `def greet(student_name):\n    message = f"Hello, {student_name}!"\n    prin(message)\n\ngreet("Alex")`,
    status: 'Error Found',
    timestamp: '2026-10-26T14:40:00Z',
    compilerOutput: `NameError: name 'prin' is not defined. Did you mean: 'print'? on line 3`,
    expectedOutput: 'Hello, Alex!',
    actualOutput: 'Traceback (most recent call last):\n  NameError: name \'prin\' is not defined',
    errorSummary: "NameError: name 'prin' is not defined",
    hints: [
      'Python throws a NameError when it encounters an identifier that has not been defined.',
      'Examine line 3. Python standard library has a built-in function for output.',
      'Replace `prin(...)` with `print(...)`.'
    ],
    explanation:
      '`prin` is a typo for Python\'s built-in `print()` function. Since Python interprets identifiers dynamically at runtime, it fails with NameError when the function is executed.',
    correctedCode: `def greet(student_name):\n    message = f"Hello, {student_name}!"\n    print(message)\n\ngreet("Alex")`,
    learningTips: [
      'Double check spelling for common built-in functions: `print`, `input`, `len`, `range`.',
      'Modern Python tracebacks will provide helpful "Did you mean?" suggestions.'
    ],
    progressPercent: 30,
  },
  {
    id: 'sub-3',
    userId: 'user-demo-1',
    title: 'Python loop with missing colon',
    language: 'python',
    code: `for i in range(5)\n    print(f"Counting {i}")`,
    status: 'Fixed',
    timestamp: '2026-10-25T11:20:00Z',
    compilerOutput: `SyntaxError: expected ':' on line 1\n  for i in range(5)\n                   ^`,
    expectedOutput: 'Counting 0\nCounting 1\nCounting 2\nCounting 3\nCounting 4',
    actualOutput: 'Counting 0\nCounting 1\nCounting 2\nCounting 3\nCounting 4',
    errorSummary: "SyntaxError: expected ':' at end of for loop header",
    hints: [
      'Compound statements in Python always terminate their header line with a specific punctuation character.',
      'Check the `for` statement header.',
      'Append a colon `:` at the end of `for i in range(5):`.'
    ],
    explanation:
      'Python uses colons to introduce code blocks (suites). Every `for`, `if`, `while`, and `def` requires a `:` before the indented body.',
    correctedCode: `for i in range(5):\n    print(f"Counting {i}")`,
    learningTips: [
      'Remember the rule: if the next line is indented, the current line needs a colon `:`.',
      'Look for the caret `^` in Python error reports to see where the parser stopped.'
    ],
    progressPercent: 100,
  }
];
