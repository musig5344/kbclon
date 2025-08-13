import 'styled-components';
// Extend the DefaultTheme interface with our theme structure
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      [key: string]: any;
    };
    tokens?: any;
    typography?: any;
    spacing?: any;
    sizes?: any;
    dimensions?: any;
    borderRadius?: any;
    shadows?: any;
    zIndex?: any;
    animation?: any;
    breakpoints?: any;
    app?: any;
    elevation?: any;
    mode?: string;
  }
}