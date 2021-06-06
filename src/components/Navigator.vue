<template>
  <div class="navigator">
    <div class="logo-container">
      <img :src="logo" alt="Logo" class="logo">
    </div>

    <div class="routes">
      <div class="decks-route">
        <router-link to="/decks">
          Decks
        </router-link>
      </div>

      <template v-if="currentDeckId.value">
        <div>
          <router-link :to="{ name: 'Deck', params: { deckId: currentDeckId.value } }">
            Deck
          </router-link>
        </div>
        <div>
          <router-link :to="{ name: 'Cards', params: { deckId: currentDeckId.value } }">
            Cards
          </router-link>
        </div>
        <div>
          <router-link :to="{ name: 'Review', params: { deckId: currentDeckId.value } }">
            Review
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
// See:
//  https://github.com/caiobiodere/cordova-template-framework7-vue-webpack/issues/7
//
const logo = require('@/assets/logo.png');

export default ({
  name: 'Navigator',

  inject: {
    currentDeckId: 'currentDeckId',
  },

  data() {
    return {
      logo,
    };
  },
});
</script>

<style scoped>
  .decks-route {
    margin-bottom: 1em;
  }

  .logo {
    max-height: 50px;
    max-width: 50px;
  }

  .logo-container {
    margin-bottom: 3em;
  }

  @media (max-width: 1023px) {
    .logo-container {
      margin-bottom: 0;
    }

    .navigator {
      display: inline-flex;
    }

    .routes {
      display: inline-flex;
      padding-top: 1em;
    }

    .routes > div {
      margin-left: 2em;
    }
  }
</style>
