export default defineAppConfig({
  ui: {
    colors: {
      primary: 'teal',      // Custom teal from design system
      secondary: 'blue',    // Nuxt UI default
      success: 'green',     // Nuxt UI default
      info: 'blue',         // Nuxt UI default
      warning: 'yellow',    // Nuxt UI default
      error: 'red',         // Nuxt UI default
      neutral: 'stone'      // Base neutral (overridden with warm colors in CSS)
    }
  }
})
