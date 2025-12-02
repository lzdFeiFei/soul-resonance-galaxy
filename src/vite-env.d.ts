/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOUBAO_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_QWEN_API_KEY: string
  readonly VITE_GLM_API_KEY: string
  readonly VITE_APP_DEBUG: string
  readonly VITE_LLM_SERVICE?: string
  readonly VITE_OPENAI_BASE_URL?: string
  readonly VITE_DOUBAO_MODEL?: string
  readonly VITE_DEEPSEEK_BASE_URL?: string
  readonly VITE_QWEN_BASE_URL?: string
  readonly VITE_GLM_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}