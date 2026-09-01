declare module 'epubjs' {
  export interface BookOptions {
    openAs?: string;
    encoding?: string;
    replacements?: string;
    canonical?: (path: string) => string;
  }

  export interface RenditionOptions {
    width?: string | number;
    height?: string | number;
    spread?: 'none' | 'always' | 'auto';
    minSpreadWidth?: number;
    flow?: 'paginated' | 'scrolled' | 'scrolled-doc' | 'auto';
    manager?: string;
    view?: string;
    stylesheet?: string;
    resizeOnOrientationChange?: boolean;
    script?: string;
  }

  export interface Location {
    start: {
      index: number;
      href: string;
      cfi: string;
      displayed: {
        page: number;
        total: number;
      };
      location?: number;
      percentage?: number;
    };
    end: {
      index: number;
      href: string;
      cfi: string;
      displayed: {
        page: number;
        total: number;
      };
      location?: number;
      percentage?: number;
    };
    atStart?: boolean;
    atEnd?: boolean;
  }

  export interface NavItem {
    id: string;
    href: string;
    label: string;
    subitems?: NavItem[];
  }

  export interface Navigation {
    toc: NavItem[];
    landmarks: any[];
    length: number;
    get: (target: string) => NavItem | undefined;
  }

  export interface Rendition {
    display: (target?: string) => Promise<void>;
    next: () => Promise<void>;
    prev: () => Promise<void>;
    themes: {
      register: (name: string, css: string | object) => void;
      select: (name: string) => void;
      fontSize: (size: string) => void;
      font: (fontFamily: string) => void;
      override: (name: string, value: string) => void;
    };
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
    destroy: () => void;
    currentLocation: () => Location;
    resize: (width: number | string, height: number | string) => void;
  }

  export interface Book {
    renderTo: (element: string | HTMLElement, options?: RenditionOptions) => Rendition;
    loaded: {
      navigation: Promise<Navigation>;
      metadata: Promise<any>;
      spine: Promise<any>;
      resources: Promise<any>;
    };
    locations: {
      generate: (chars?: number) => Promise<string[]>;
      percentageFromCfi: (cfi: string) => number;
      cfiFromPercentage: (percentage: number) => string;
      locationFromCfi: (cfi: string) => number;
    };
    navigation: Navigation;
    destroy: () => void;
    ready: Promise<any>;
  }

  export default function ePub(url?: string | ArrayBuffer, options?: BookOptions): Book;
}
