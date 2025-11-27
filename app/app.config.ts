export default defineAppConfig({
  ui: {
    button: {
      slots: {
        base: 'rounded-full'
      },
      compoundVariants: [{
        color: 'neutral',
        variant: 'soft',
        class: 'bg-muted hover:bg-elevated pressed:bg-accented'
      }
      ],
      defaultVariants: {
        color: 'neutral',
        variant: 'soft'
      }
    },
    input: {
      slots: {
        base: 'placeholder:text-muted'
      },
    }
  },
});
