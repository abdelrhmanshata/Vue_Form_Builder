<template>
  <div class="history-controls">
    <v-btn
      icon="mdi-undo"
      size="small"
      variant="text"
      :disabled="!canUndo"
      @click="$emit('undo')"
      v-tooltip="'Undo (Ctrl+Z)'"
    />
    <v-btn
      icon="mdi-redo"
      size="small"
      variant="text"
      :disabled="!canRedo"
      @click="$emit('redo')"
      v-tooltip="'Redo (Ctrl+Y)'"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  canUndo: boolean;
  canRedo: boolean;
}

defineProps<Props>();
defineEmits(["undo", "redo"]);
</script>

<style scoped>
.history-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
