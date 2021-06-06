import Decks from '@/components/Decks.vue';
import { shallowMount } from '@vue/test-utils';

describe('Decks.vue', () => {
  const Db = {};

  it('Contains Create button.', () => {
    // See:
    //  - https://github.com/vuejs/vue-test-utils/issues/1698
    //  - https://next.vue-test-utils.vuejs.org/api/#global
    //  - https://next.vue-test-utils.vuejs.org/guide/advanced/stubs-shallow-mount.html#stubbing-a-single-child-component
    //
    const wrapper = shallowMount(
      Decks,
      {
        global: {
          provide: {
            Db,
          },
          stubs: {
            'router-link': {
              template: '<span/>',
            },
          },
        },
      },
    );
    const button = wrapper.find('button');
    expect(button.text()).toMatch('Create');
  });
});
