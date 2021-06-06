import { createApp } from 'vue';
import App from './App.vue';
import dialog from './plugins/dialog-plugin';
import router from './router';

const app = createApp(App);

/*
app.config.errorHandler = (err, vm, info) => {
  console.log(err);
  console.log(vm);
  console.log(info);
};
*/

app
  .use(dialog)
  .use(router)
  .mount('#app');
