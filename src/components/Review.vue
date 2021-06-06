<template>
  <div v-if="card && card.id" class="content">
    <p>
      {{card.sideA}}
    </p>

    <div :style="evaluated ? { 'visibility': 'visible' } : { 'visibility': 'hidden' }">
      <hr>

      <p>
        {{card.sideB}}
      </p>

      <hr>

      <p>
        {{card.notes}}
      </p>
    </div>

    <hr>

    <div class="columns is-centered" v-if="evaluated">
      <button type="button"
        class="button is-primary"
        @click="throttledNext()">
        Next
      </button>
    </div>
    <div class="columns is-centered" v-else>
      <button type="button"
        class="button is-primary ml-2"
        v-for="value in [0, 1, 2, 3, 4]" :key="value"
        @click="throttledEvaluate(value)">
        {{value}}
      </button>
    </div>
  </div>
  <div v-else class="content">
    <p>
      No card to review.
    </p>
  </div>
</template>

<script>
import Planner from '@/model/planner';
import throttle from 'lodash-es/throttle';

export default {
  name: 'Review',

  inject: {
    currentDeckId: 'currentDeckId',
    Db: 'Db',
  },

  beforeCreate() {
    this.throttledEvaluate = throttle(async function evaluateThrottling(value) {
      this.evaluate(value);
    }, 500);
    this.throttledNext = throttle(async function nextThrottling() {
      this.next();
    }, 500);
  },
  async created() {
    const { deckId } = this.$route.params;
    this.deckId = deckId;
    await this.next();

    this.currentDeckId.value = deckId;
  },
  unmounted() {
    // this.throttledEvaluate.cancel();
    // this.throttledNext.cancel();
  },

  data() {
    return {
      deckId: null,
      evaluated: false,
      card: {
        id: 0,
        sideA: '',
        sideB: '',
        notes: '',
        isBA: false,
        lastDate: null,
      },
    };
  },

  methods: {
    async evaluate(value) {
      if (this.card && !this.evaluated) {
        const date = new Date();
        const lastDate = new Date(Date.parse(this.card.lastDate));
        const plannerResult = Planner.planNext(value, date, lastDate);

        await this.Db.review(this.card, value, date, plannerResult.nextDate);
      }

      this.evaluated = true;
    },
    async next() {
      const data = await this.Db.searchNextCardToReview(this.deckId);
      this.card = data;

      this.evaluated = false;
    },
  },
};
</script>
