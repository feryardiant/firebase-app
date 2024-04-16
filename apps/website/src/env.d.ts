/// <reference lib="DOM" />
/// <reference types="@intlify/unplugin-vue-i18n/messages" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-vue-layouts/client" />
/// <reference types="vitest" />
/// <reference types="vue/ref-macros" />

declare interface Window {
  // extend the window
}

interface ImportMetaEnv {
  VITE_GTM_KEY: string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}

declare module '*.md' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}
