/// <reference types="vite/client" />

declare module "@ant-design/plots" {
  import type { ComponentType } from "react";

  export const Column: ComponentType<Record<string, unknown>>;
  export const Line: ComponentType<Record<string, unknown>>;
  export type ColumnConfig = {
    data?: unknown[];
    [key: string]: unknown;
  };
  export type LineConfig = {
    data?: unknown[];
    [key: string]: unknown;
  };
}

declare module "mammoth" {
  export interface Options {
    arrayBuffer: ArrayBuffer;
  }
  export interface Result {
    value: string;
    messages: unknown[];
  }
  export function extractRawText(options: Options): Promise<Result>;
}
