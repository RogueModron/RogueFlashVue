<template>
  <button type="button"
    class="button is-danger is-rounded delete-button"
    @click="openDeleteDialog()">
    -
  </button>
  <form class="box">
    <div class="field">
      <label class="label">
          Side A
      </label>
      <div class="control">
        <textarea rows="5"
          class="textarea is-primary"
          v-model="card.sideA"
          @blur="throttledSave()"></textarea>
      </div>
    </div>
    <div class="field">
      <label class="label">
          Side B
      </label>
      <textarea rows="5"
        class="textarea is-primary"
        v-model="card.sideB"
        @blur="throttledSave()"></textarea>
    </div>
    <div class="field">
      <label class="label">
          Tags
      </label>
      <input type="text"
        class="input is-primary"
        v-model="card.tags"
        @blur="throttledSave()">
    </div>
    <div class="field">
      <label class="label">
          Notes
      </label>
      <textarea rows="5"
        class="textarea is-primary"
        v-model="card.notes"
        @blur="throttledSave()"></textarea>
    </div>
    <div>
      <label class="checkbox">
        <input type="checkbox"
          v-model="card.noBA"
          @blur="throttledSave()">
        Disable B-A
      </label>
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
  name: 'Card',

  inject: {
    currentDeckId: 'currentDeckId',
    Db: 'Db',
  },

  beforeCreate() {
    this.throttledSave = throttle(async function saveThrottling() {
      this.saveCard();
    }, 500);
  },
  async created() {
    const { cardId } = this.$route.params;
    await this.fetchCard(cardId);

    this.currentDeckId.value = this.card.deckId;
  },
  unmounted() {
    // this.throttledSave.cancel();
  },

  data() {
    return {
      card: {
        deckId: 0,
        sideA: '',
        sideB: '',
        tags: '',
        notes: '',
        noBA: false,
        rev: '',
      },
      changes: false,
    };
  },
  watch: {
    card: {
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
    async fetchCard(id) {
      const data = await this.Db.readCard(id);
      this.card = data;
    },
    async deleteCard() {
      await this.Db.deleteCard(this.card);

      const parts = this.$route.path.split('/');
      let path = '/';
      if (parts.length > 1) {
        path = parts.slice(0, -1).join('/');
      }
      this.$router.push(`${path}`);
    },
    async saveCard() {
      if (!this.changes) {
        return;
      }

      this.changes = false;

      const data = await this.Db.updateCard(this.card);
      if (data) {
        setRev(this.card, getRev(data));
      }
    },
    openDeleteDialog() {
      this.$dialog({
        title: 'Warning',
        message: 'Delete card?',
        executeActionCallback: this.deleteCard,
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
