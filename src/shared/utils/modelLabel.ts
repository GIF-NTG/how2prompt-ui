const MODEL_LABEL: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  claude: 'Claude',
  gemini: 'Gemini',
}

export function getModelLabel(code: string): string {
  return MODEL_LABEL[code] ?? code
}
