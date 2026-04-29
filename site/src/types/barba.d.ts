// @barba/core ships its own runtime but no .d.ts; provide a minimal ambient
// declaration that covers the surface this app uses.
declare module '@barba/core' {
  export interface BarbaContainerData {
    container: HTMLElement;
    namespace: string;
    url: { href: string };
  }
  export interface BarbaTransitionData {
    current: BarbaContainerData;
    next: BarbaContainerData;
    trigger: HTMLElement | string;
  }
  export interface BarbaTransition {
    name?: string;
    sync?: boolean;
    from?: { namespace?: string | string[] };
    to?: { namespace?: string | string[] };
    once?: (data: BarbaTransitionData) => void | Promise<void>;
    leave?: (data: BarbaTransitionData) => void | Promise<void>;
    enter?: (data: BarbaTransitionData) => void | Promise<void>;
    after?: (data: BarbaTransitionData) => void | Promise<void>;
    before?: (data: BarbaTransitionData) => void | Promise<void>;
  }
  export interface BarbaInitOptions {
    transitions?: BarbaTransition[];
    views?: unknown[];
    debug?: boolean;
    timeout?: number;
    preventRunning?: boolean;
  }
  interface Barba {
    init: (options?: BarbaInitOptions) => void;
    destroy: () => void;
    go: (href: string) => Promise<void>;
  }
  const barba: Barba;
  export default barba;
}
