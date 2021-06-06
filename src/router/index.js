import Card from '@/components/Card.vue';
import Cards from '@/components/Cards.vue';
import Deck from '@/components/Deck.vue';
import Decks from '@/components/Decks.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/decks' },
  {
    path: '/decks/:deckId/cards/:cardId',
    name: 'Card',
    component: Card,
  },
  {
    path: '/decks/:deckId/cards',
    name: 'Cards',
    component: Cards,
  },
  {
    path: '/decks/:deckId',
    name: 'Deck',
    component: Deck,
  },
  {
    path: '/decks',
    name: 'Decks',
    component: Decks,
  },
  {
    path: '/decks/:deckId/review',
    name: 'Review',
    component: () => import(
      /* webpackChunkName: "review" */ '@/components/Review.vue'
    ),
  },
  { path: '/*', redirect: '/decks' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  Object.keys(to.params).forEach((key) => {
    if (key.endsWith('Id')) {
      const id = to.params[key];
      // Ex.: 9e7aee77-306e-4bb6-853d-c21ec9987587
      const re = /([\d\w]{8}-)([\d\w]{4}-)([\d\w]{4}-)([\d\w]{4}-)([\d\w]{12})/;
      if (!id.match(re)) {
        next('/');
      }
    }
  });

  next();
});

export default router;
