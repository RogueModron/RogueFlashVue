<template>
  <div>
    <div class="field has-addons has-addons-centered">
      <div class="control">
        <input type="search"
          class="input is-primary"
          placeholder="..."
          v-model="searchKey"
          @keydown.enter="throttledSearch()">
      </div>
      <div class="control">
        <button type="button"
          class="button is-primary is-outlined"
          @click="throttledSearch()">
          Search
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import throttle from 'lodash-es/throttle';

export default ({
  name: 'Search',

  // See:
  //  https://v3.vuejs.org/guide/data-methods.html#debouncing-and-throttling
  //  https://forum.vuejs.org/t/lodash-debounce-not-working-when-placed-inside-a-method/86334/5
  //
  created() {
    this.throttledSearch = throttle(function searchThrottling() {
      this.search();
    }, 500);
  },
  unmounted() {
    this.throttledSearch.cancel();
  },

  data() {
    return {
      searchKey: '',
    };
  },

  emits: [
    'searchRequest',
  ],

  methods: {
    search() {
      this.$emit('searchRequest', this.searchKey);
    },
  },
});
</script>
