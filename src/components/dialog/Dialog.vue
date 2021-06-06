<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <div class="dialog-title">
          {{title}}
        </div>
        <hr class="my-1">
        <div class="dialog-message px-2 py-4">
          {{message}}
        </div>
        <hr class="my-1">
        <div class="dialog-buttons">
          <button type="button"
            class="button is-primary"
            @click="executeAction()">
            {{executeButtonLabel}}
          </button>
          <button type="button"
            class="button is-light ml-1"
            @click="cancelAction()">
            {{cancelButtonLabel}}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default ({
  name: 'Dialog',

  props: {
    container: Object,
    title: {
      type: String,
      default: 'Alert',
    },
    message: {
      type: String,
      default: '',
    },
    executeButtonLabel: {
      type: String,
      default: 'Ok',
    },
    cancelButtonLabel: {
      type: String,
      default: 'Cancel',
    },
    executeActionCallback: Function,
    cancelActionCallback: Function,
  },

  data() {
    return {
      app: null,
    };
  },

  emits: [
    'executeActionRequest',
    'cancelActionRequest',
  ],

  methods: {
    afterMountSetup(app) {
      this.app = app;
    },
    close() {
      if (!this.app) {
        return;
      }

      if (this.$el.parentNode) {
        this.$el.parentNode.remove();
      } else if (this.$el.remove) {
        this.$el.remove();
      }

      this.app.unmount();
    },
    cancelAction() {
      if (this.cancelActionCallback) {
        this.cancelActionCallback();
      } else {
        this.$emit('cancelActionRequest');
      }
      this.close();
    },
    executeAction() {
      if (this.executeActionCallback) {
        this.executeActionCallback();
      } else {
        this.$emit('executectionRequest');
      }
      this.close();
    },
  },
});
</script>

<style scoped>
  .dialog-buttons {
    text-align: center;
  }

  .dialog-title {
    font-weight: bold;
  }
</style>
