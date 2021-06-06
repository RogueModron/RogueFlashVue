<template>
  <button type="button"
    class="button is-primary is-rounded create-button"
    @click="create()">
    +
  </button>
  <search @searchRequest="search($event)"></search>
  <div class="mt-5">
    <template v-for="card in cards" :key="card._id">
      <div class="card mb-4">
        <header class="card-header">
          <div class="card-header-title">
            {{card.sideA || '[To Complete]'}}
          </div>
        </header>
        <div class="card-content">
          <div class="content">
            <p>
              {{card.sideB || '[To Complete]'}}
            </p>
            <p>
              {{card.notes}}
            </p>
          </div>
        </div>
        <footer class="card-footer">
          <router-link
            :to="{ name: 'Card', params: { cardId: card._id } }"
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
  name: 'Cards',

  components: {
    Search,
  },

  inject: {
    currentDeckId: 'currentDeckId',
    Db: 'Db',
  },

  async created() {
    const { deckId } = this.$route.params;
    this.deckId = deckId;

    await this.search('');

    this.currentDeckId.value = deckId;
  },

  data() {
    return {
      deckId: null,
      cards: [],
    };
  },

  methods: {
    async create() {
      const newCard = {
        deckId: this.deckId,
        sideA: '',
        sideB: '',
        tags: '',
        notes: '',
        noBA: false,
        lastAB: '',
        nextAB: '',
        lastBA: '',
        nextBA: '',
      };
      const card = await this.Db.createCard(newCard);

      const id = getId(card);
      this.$router.push(`/decks/${this.deckId}/cards/${id}`);
    },
    async search(searchKey) {
      const data = await this.Db.searchCards(this.deckId, searchKey);
      this.cards = data.docs;
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
