/// <reference types="react-scripts" />
declare module '*.otf';
// Webpack require.context 타입 정의
declare global {
  interface NodeRequire {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
      mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'
    ): __WebpackModuleApi.RequireContext;
  }
}
declare namespace __WebpackModuleApi {
  interface RequireContext {
    keys(): string[];
    (id: string): any;
    <T>(id: string): T;
    resolve(id: string): string;
    id: string;
  }
}
