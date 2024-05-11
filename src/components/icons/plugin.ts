import { App, Component } from 'vue';

import * as icons from './';

export default {
  install: (vue: App) => {
    Object.keys(icons).forEach((k) => {
      vue.component(k, (icons as Record<string, Component>)[k]);
    });
  },
};
