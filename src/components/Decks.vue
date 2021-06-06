<template>
  <button type="button"
    class="button is-primary is-rounded create-button"
    @click="create()">
    +
  </button>
  <search @searchRequest="search($event)"></search>
  <div class="mt-5">
    <template v-for="deck in decks" :key="deck._id">
      <div class="card mb-4">
        <header class="card-header">
          <p class="card-header-title">
            {{deck.description || '[To Complete]'}}
          </p>
        </header>
        <div class="card-content">
          <div class="content">
            {{deck.notes}}
          </div>
        </div>
        <footer class="card-footer">
          <router-link
            :to="{ name: 'Deck', params: { deckId: deck._id } }"
            class="card-footer-item">
            OPEN
          </router-link>
        </footer>
      </div>
    </template>
  </div>
</template>

<script>
import { getId } from '@/model/db';
import Search from '@/components/Search.vue';

export default ({
  name: 'Decks',

  components: {
    Search,
  },

  inject: {
    currentDeckId: 'currentDeckId',
    Db: 'Db',
  },

  async created() {
    await this.search('');

    this.currentDeckId.value = null;
  },

  data() {
    return {
      decks: [],
    };
  },

  methods: {
    async create() {
      const newDeck = {
        description: '',
        notes: '',
      };
      const deck = await this.Db.createDeck(newDeck);

      const id = getId(deck);
      this.$router.push(`/decks/${id}`);
    },
    async search(searchKey) {
      const data = await this.Db.searchDecks(searchKey);
      this.decks = data.docs;
    },
  },
});
</script>

<style scoped>
  .create-button {
    bottom: 2em;
    position: fixed;
    right: 1em;
    z-index: 10;
  }
</style>
