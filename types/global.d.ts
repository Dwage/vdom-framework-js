import { VNode } from "../src/vdom";
import { SyntheticEvent } from "../src/eventSystem";

/**
 * Event handler type for synthetic events
 * @template E The event type, defaults to SyntheticEvent
 */
type EventHandler<E = SyntheticEvent> = (event: E) => void;

/**
 * Common HTML attributes applicable to most elements
 */
interface HTMLAttributes {
  // Base attributes
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
  title?: string;
  tabIndex?: number;
  hidden?: boolean;

  // Synthetic event handlers
  onClick?: EventHandler;
  onDoubleClick?: EventHandler;
  onChange?: EventHandler;
  onInput?: EventHandler;
  onKeyDown?: EventHandler;
  onKeyUp?: EventHandler;
  onKeyPress?: EventHandler;
  onFocus?: EventHandler;
  onBlur?: EventHandler;
  onSubmit?: EventHandler;

  // Mouse event handlers
  onMouseDown?: EventHandler;
  onMouseUp?: EventHandler;
  onMouseEnter?: EventHandler;
  onMouseLeave?: EventHandler;
  onMouseMove?: EventHandler;
  onMouseOver?: EventHandler;
  onMouseOut?: EventHandler;

  // Data attributes
  data?: any;
  key?: string | number;

  // Accessibility attributes
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaHidden?: boolean;

  // Children
  children?: any;
}

/**
 * Input element specific attributes
 * Extends HTMLAttributes with input-specific properties
 */
interface InputHTMLAttributes extends HTMLAttributes {
  type?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  name?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * Button element specific attributes
 * Extends HTMLAttributes with button-specific properties
 */
interface ButtonHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  type?: "submit" | "reset" | "button";
  value?: string | ReadonlyArray<string> | number;
}

/**
 * Image element specific attributes
 * Extends HTMLAttributes with img-specific properties
 */
interface ImgHTMLAttributes extends HTMLAttributes {
  alt?: string;
  src?: string;
  srcSet?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
  loading?: "eager" | "lazy";
  decoding?: "sync" | "async" | "auto";
}

/**
 * Anchor element specific attributes
 * Extends HTMLAttributes with anchor-specific properties
 */
interface AnchorHTMLAttributes extends HTMLAttributes {
  href?: string;
  target?: string;
  rel?: string;
  download?: any;
  hrefLang?: string;
}

/**
 * Form element specific attributes
 * Extends HTMLAttributes with form-specific properties
 */
interface FormHTMLAttributes extends HTMLAttributes {
  action?: string;
  method?: string;
  encType?: string;
  target?: string;
  noValidate?: boolean;
  autoComplete?: string;
}

/**
 * Textarea element specific attributes
 * Extends HTMLAttributes with textarea-specific properties
 */
interface TextareaHTMLAttributes extends HTMLAttributes {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  rows?: number;
  cols?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  name?: string;
  maxLength?: number;
  minLength?: number;
  wrap?: string;
}

/**
 * Select element specific attributes
 * Extends HTMLAttributes with select-specific properties
 */
interface SelectHTMLAttributes extends HTMLAttributes {
  value?: string | ReadonlyArray<string> | number;
  defaultValue?: string | ReadonlyArray<string> | number;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  name?: string;
  size?: number;
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * Global namespace for JSX typings
 * Provides type definitions for the JSX factory
 */
declare global {
  namespace JSX {
    /**
     * Base interface for all JSX elements
     * All JSX elements extend the VNode interface
     */
    interface Element extends VNode {}

    /**
     * Defines where to look for props in custom components
     */
    interface ElementAttributesProperty {
      props: {};
    }

    /**
     * Defines where to look for children in custom components
     */
    interface ElementChildrenAttribute {
      children: {};
    }

    /**
     * Definition of all built-in HTML elements and their attributes
     */
    interface IntrinsicElements {
      // Block-level elements
      div: HTMLAttributes;
      p: HTMLAttributes;
      h1: HTMLAttributes;
      h2: HTMLAttributes;
      h3: HTMLAttributes;
      h4: HTMLAttributes;
      h5: HTMLAttributes;
      h6: HTMLAttributes;

      // Text-level elements
      span: HTMLAttributes;
      strong: HTMLAttributes;
      em: HTMLAttributes;
      b: HTMLAttributes;
      i: HTMLAttributes;
      u: HTMLAttributes;
      s: HTMLAttributes;
      code: HTMLAttributes;
      pre: HTMLAttributes;

      // Interactive elements with specific attributes
      button: ButtonHTMLAttributes;
      input: InputHTMLAttributes;
      textarea: TextareaHTMLAttributes;
      select: SelectHTMLAttributes;
      option: HTMLAttributes & {
        value?: string | number;
        selected?: boolean;
        disabled?: boolean;
      };

      // Navigation elements
      a: AnchorHTMLAttributes;
      nav: HTMLAttributes;

      // List elements
      ul: HTMLAttributes;
      ol: HTMLAttributes;
      li: HTMLAttributes;
      dl: HTMLAttributes;
      dt: HTMLAttributes;
      dd: HTMLAttributes;

      // Structural elements
      header: HTMLAttributes;
      footer: HTMLAttributes;
      main: HTMLAttributes;
      section: HTMLAttributes;
      article: HTMLAttributes;
      aside: HTMLAttributes;

      // Table elements
      table: HTMLAttributes;
      thead: HTMLAttributes;
      tbody: HTMLAttributes;
      tfoot: HTMLAttributes;
      tr: HTMLAttributes;
      th: HTMLAttributes & {
        scope?: string;
        colSpan?: number;
        rowSpan?: number;
      };
      td: HTMLAttributes & { colSpan?: number; rowSpan?: number };

      // Multimedia elements
      img: ImgHTMLAttributes;
      video: HTMLAttributes & {
        src?: string;
        autoPlay?: boolean;
        controls?: boolean;
        loop?: boolean;
        muted?: boolean;
        poster?: string;
      };
      audio: HTMLAttributes & {
        src?: string;
        autoPlay?: boolean;
        controls?: boolean;
        loop?: boolean;
        muted?: boolean;
      };

      // Form elements
      form: FormHTMLAttributes;
      label: HTMLAttributes & { htmlFor?: string };
      fieldset: HTMLAttributes & {
        disabled?: boolean;
        form?: string;
        name?: string;
      };
      legend: HTMLAttributes;

      // Miscellaneous elements
      hr: HTMLAttributes;
      br: HTMLAttributes;
      iframe: HTMLAttributes & {
        src?: string;
        width?: string | number;
        height?: string | number;
        sandbox?: string;
      };

      // Semantic elements
      address: HTMLAttributes;
      blockquote: HTMLAttributes & { cite?: string };
      cite: HTMLAttributes;
      q: HTMLAttributes & { cite?: string };

      // SVG elements
      svg: HTMLAttributes & {
        viewBox?: string;
        xmlns?: string;
        width?: string | number;
        height?: string | number;
      };
      path: HTMLAttributes & {
        d?: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: string | number;
      };
      circle: HTMLAttributes & {
        cx?: string | number;
        cy?: string | number;
        r?: string | number;
        fill?: string;
        stroke?: string;
      };
      rect: HTMLAttributes & {
        x?: string | number;
        y?: string | number;
        width?: string | number;
        height?: string | number;
        fill?: string;
        stroke?: string;
      };

      // Support for custom elements
      [elemName: string]: any;
    }
  }
}
