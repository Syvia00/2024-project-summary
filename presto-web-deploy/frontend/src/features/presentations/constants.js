export const ELEMENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  CODE: 'code'
};
  
export const PROGRAMMING_LANGUAGES = {
  C: 'c',
  PYTHON: 'python',
  JAVASCRIPT: 'javascript'
};
  
// Function to detect programming language from code
export const detectLanguage = (code) => {
  // Simple detection based on keywords and syntax
  if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
    return PROGRAMMING_LANGUAGES.PYTHON;
  } else if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
    return PROGRAMMING_LANGUAGES.JAVASCRIPT;
  } else if (code.includes('int main') || code.includes('#include')) {
    return PROGRAMMING_LANGUAGES.C;
  }
  return PROGRAMMING_LANGUAGES.JAVASCRIPT; // default
};

export const FONT_FAMILIES = {
  Arail: 'Arial, sans-serif',
  Georgia: 'Georgia, serif',
  Helvetica: 'Helvetica Neue, sans-serif',
  Monaco: 'Monaco, monospace'
};

export const BACKGROUND_TYPES = {
  SOLID: 'solid',
  GRADIENT: 'gradient',
  IMAGE: 'image'
};

export const GRADIENT_DIRECTIONS = {
  TOP_BOTTOM: 'to bottom',
  LEFT_RIGHT: 'to right',
  DIAGONAL: 'to bottom right'
};