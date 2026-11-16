// Lets the type-aware linter resolve .vue imports from TypeScript files (vue-tsc already understands them).
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}
