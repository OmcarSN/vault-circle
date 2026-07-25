/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAULT_CIRCLE_ADDRESS?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
