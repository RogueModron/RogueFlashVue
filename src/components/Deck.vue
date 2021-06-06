<template>
  <button type="button"
    class="button is-danger is-rounded delete-button"
    @click="openDeleteDialog()">
    -
  </button>
  <form class="box">
    <div class="field">
      <label class="label">
          Description
      </label>
      <div class="control">
        <input type="text"
          class="input is-primary"
          v-model="deck.description"
          @blur="throttledSave()">
      </div>
    </div>
    <div class="field">
      <label class="label">
          Notes
      </label>
      <div class="control">
        <textarea rows="5"
          class="textarea is-primary"
          v-model="deck.notes"
          @blur="throttledSave()"></textarea>
      </div>
    </div>
  </form>
</template>

<script>
import {
  getRev,
  setRev,
} from '@/model/db';
import throttle from 'lodash-es/throttle';

export default ({
  name: 'Deck',

  inject: {
    currentDeckId: 'currentDeckId',
    Db: 'Db',
  },

  beforeCreate() {
    this.throttledSave = throttle(async function saveThrottling() {
      this.saveDeck();
    }, 500);
  },
  async created() {
    const { deckId } = this.$route.params;
    await this.fetchDeck(deckId);

    this.currentDeckId.value = deckId;
  },
  unmounted() {
    // this.throttledSave.cancel();
  },

  data() {
    return {
      deck: {
        description: '',
        notes: '',
        rev: '',
      },
      changes: false,
    };
  },
  watch: {
    deck: {
      handler: function handler(current, old) {
        if (getRev(current) !== getRev(old)) {
          return;
        }
        this.changes = true;
      },
      deep: true,
    },
  },

  methods: {
    async fetchDeck(id) {
      const data = await this.Db.readDeck(id);
      this.deck = data;
    },
    async deleteDeck() {
      await this.Db.deleteDeck(this.deck);

      const parts = this.$route.path.split('/');
      let path = '/';
      if (parts.length > 1) {
        path = parts.slice(0, -1).join('/');
      }
      this.$router.push(`${path}`);
    },
    async saveDeck() {
      if (!this.changes) {
        return;
      }

      this.changes = false;

      const data = await this.Db.updateDeck(this.deck);
      if (data) {
        setRev(this.deck, getRev(data));
      }
    },
    openDeleteDialog() {
      this.$dialog({
        title: 'Warning',
        message: 'Delete deck?',
        executeActionCallback: this.deleteDeck,
      });
    },
  },
});
</script>

<style scoped>
  .delete-button {
    bottom: 2em;
    position: fixed;
    right: 1em;
    z-index: 10;
  }
</style>
