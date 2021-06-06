<template>
  <div class="container is-fluid is-fullhd">
    <div class="columns is-centered">
      <div class="column is-2">
        <navigator></navigator>
      </div>
      <div class="column is-10">
        <main class="p-5">
          <router-view/>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Db from '@/model/db';
import Navigator from '@/components/Navigator.vue';
import initBackspaceFilter from '@/utils';

/*
  Db is passed to other components with provide/inject, for other possible solutions:

  - https://markus.oberlehner.net/blog/dependency-injection-in-vue-applications/
  - https://lukeliutingchun.medium.com/vue-js-using-a-stateful-angular-like-service-to-organize-your-code-abf109f32ab7
  - https://stackoverflow.com/questions/41164672/whats-the-equivalent-of-angular-service-in-vuejs
*/

export default {
  components: {
    Navigator,
  },

  provide: {
    currentDeckId: ref(null),
    Db: new Db(),
  },

  created() {
    initBackspaceFilter();
  },
};
</script>

<style>
  @import '../node_modules/bulma/css/bulma.css';
</style>
