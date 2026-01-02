declare namespace NodeJS {
  interface ProcessEnv {
    TYPESENSE_HOST: string;
    TYPESENSE_PORT: number;
    TYPESENSE_PROTOCOL: string;
    TYPESENSE_ADMIN_API_KEY: string;
  }
}