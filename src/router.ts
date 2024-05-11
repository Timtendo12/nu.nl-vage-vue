import { createMemoryHistory, createRouter, createWebHistory, Router } from 'vue-router';

import FullPage from '@/pages/FullPage/FullPage.vue';
import MultiBlockPage from '@/pages/MultiBlockPage.vue';
import SingleBlockPage from '@/pages/SingleBlockPage.vue';
import Talk2022Page from '@/pages/Talk2022Page.vue';

import { gameRouter } from './game-router';

export default function (type?: string): Router {
  const routerHistory = type === 'client' ? createWebHistory() : createMemoryHistory();

  const router = createRouter({
    history: routerHistory,
    routes: [
      ...gameRouter,
      {
        path: '/component/:slug',
        name: 'MultiBlockPage',
        component: MultiBlockPage,
        props: true,
        children: [
          {
            path: 'skip',
            component: MultiBlockPage,
            meta: { skip: true },
          },
        ],
      },
      {
        path: '/components/comments/:type/:id',
        name: 'Talk2022Page',
        component: Talk2022Page,
        props: true,
      },
      {
        path: '/blocks',
        name: 'SingleBlockPage',
        component: SingleBlockPage,
      },
      {
        path: '/:path(.*)',
        name: 'FullPage',
        component: FullPage,
        props: true,
      },
    ],
  });

  return router;
}
