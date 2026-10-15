declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXComponents } from "mdx/types";
  const Component: ComponentType<{ components?: MDXComponents }>;
  export default Component;
}

declare module "virtual:lesson-sources" {
  const sources: Record<string, string>;
  export default sources;
}
