<template>
  <path
    class="other"
    fill="currentColor"
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M17.6 20a2.4 2.4 0 1 1 4.8 0 2.4 2.4 0 0 1-4.8 0zm-16-8a2.4 2.4 0 1 1 4.8 0 2.4 2.4 0 0 1-4.8 0Zm20.8-8a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 0 1 4.8 0zm-5.53 13.54-9.02-4.51c.09-.33.15-.67.15-1.03s-.06-.7-.15-1.03l9.02-4.51A3.98 3.98 0 0 0 24 4a4 4 0 0 0-8 0c0 .36.06.7.15 1.03L7.13 9.54A3.98 3.98 0 0 0 0 12a3.98 3.98 0 0 0 7.13 2.46l9.02 4.51A4 4 0 1 0 20 16c-1.28 0-2.4.61-3.13 1.54z"
  />
  <path
    class="apple"
    fill="currentColor"
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M 14.9822 5.9195 L 11.3761 2.3134 l -3.6061 3.6061 l -0.9526 -0.9526 L 11.3761 0.4082 l 4.5587 4.5587 z M 10.6957 1.3608 h 1.3608 v 14.2884 h -1.3608 z M 18.1801 23.814 H 4.5721 c -1.1567 0 -2.0412 -0.8845 -2.0412 -2.0412 V 9.5256 c 0 -1.1567 0.8845 -2.0412 2.0412 -2.0412 h 4.7628 v 1.3608 h -4.7628 c -0.4082 0 -0.6804 0.2722 -0.6804 0.6804 v 12.2472 c 0 0.4082 0.2722 0.6804 0.6804 0.6804 h 13.608 c 0.4082 0 0.6804 -0.2722 0.6804 -0.6804 V 9.5256 c 0 -0.4082 -0.2722 -0.6804 -0.6804 -0.6804 h -4.7628 v -1.3608 h 4.7628 c 1.1567 0 2.0412 0.8845 2.0412 2.0412 v 12.2472 c 0 1.1567 -0.8845 2.0412 -2.0412 2.0412 z"
  />
</template>

<style scoped>
.apple {
  display: none;
}

@supports (-webkit-touch-callout: none) {
  .other {
    display: none;
  }

  .apple {
    display: inherit;
  }
}
</style>
