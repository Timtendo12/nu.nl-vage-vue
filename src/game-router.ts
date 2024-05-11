import { RouterOptions } from 'vue-router';

import FullWidthGamePage from '@/pages/FullWidthGamePage.vue';

export const gameRouter: RouterOptions['routes'] = [
  {
    path: '/wielerspel-tour',
    name: 'WielerspelTour',
    component: FullWidthGamePage,
    props: {
      url: 'https://nu.persgroepwielerspel.nl/game/tour2024/',
      id: 'wieler-spel',
    },
  },
  {
    path: '/gp-spel',
    name: 'GpSpel',
    component: FullWidthGamePage,
    props: {
      url: 'https://f1spel.nu.nl/',
      id: 'gp-spel',
    },
  },
  {
    path: '/themaquiz',
    name: 'ThemaQuiz',
    component: FullWidthGamePage,
    props: {
      url: 'https://dpg-quiz-platform.sportgamescompany.com/account/dpg/game/XGfZyluBR6C7CVaBMr2qZQ/',
      id: 'thema-quiz',
    },
  },
  {
    path: '/nieuwsquiz',
    name: 'NieuwsQuiz',
    component: FullWidthGamePage,
    props: {
      url: 'https://dpg-quiz-platform.sportgamescompany.com/account/dpg/game/YhLt1uGORFO4CMODFwjb6A/',
      id: 'nieuwsquiz',
    },
  },
  {
    path: '/ek-spel',
    name: 'EkSpel',
    component: FullWidthGamePage,
    props: {
      url: 'https://nu-footballpredictor.sportgamescompany.com/game/ek-2024/',
      id: 'ek-spel',
    },
  },
];
