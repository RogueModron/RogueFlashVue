import Dialog from '@/components/dialog/Dialog.vue';
import { createApp } from 'vue';

export default {
  install(app) {
    function openDialog(options = {}) {
      /*
        With Vue 3, Vue.extend has been removed, now there is createApp.
        destroy has been removed too:

        "Users should no longer manually manage the lifecycle of individual Vue
        components."

        - https://v3.vuejs.org/guide/migration/introduction.html#removed-apis

        So, appComponent is passed to component with the afterMountSetup
        method, in order to be used when the dialog is closed.

        - https://stackoverflow.com/questions/64251487/vue3-creating-component-instances-programmatically-on-button-click
        - https://stackoverflow.com/questions/64862417/is-it-possible-to-render-a-component-automatically-in-vue-3
        - https://www.reddit.com/r/vuejs/comments/jbjl2u/simplest_example_creating_plugins_for_vue_3/
        - https://auth0.com/blog/how-to-create-a-vue-plugin/
        - https://github.com/buefy/buefy/blob/dev/src/components/dialog/index.js
      */

      const appComponent = createApp(Dialog, options);

      const div = document.createElement('div');
      const body = document.querySelector('body');
      body.appendChild(div);

      const component = appComponent.mount(div);
      component.afterMountSetup(appComponent);
      return component;
    }

    // See:
    //  https://stackoverflow.com/questions/35637770/how-to-avoid-no-param-reassign-when-setting-a-property-on-a-dom-object
    //
    const global = app.config.globalProperties;
    global.$dialog = openDialog;
  },
};
