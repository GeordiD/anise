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
    },
    dropdownMenu: {
      compoundVariants: [{
        color: 'neutral',
        active: false,
        class: {
          item: 'data-highlighted:before:bg-accented/50 data-[state=open]:before:bg-accented/50'
        }
      }]
    }
  },
});
