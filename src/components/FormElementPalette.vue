<template>
  <v-card class="form-palette" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-palette" class="mr-2" />
      Form Elements
    </v-card-title>
    
    <v-card-text class="pa-2">
      <div class="element-grid">
        <div
          v-for="template in formElementTemplates"
          :key="template.type"
          class="element-item"
          draggable="true"
          @dragstart="onDragStart($event, template)"
          @dragend="onDragEnd"
        >
          <v-card
            class="element-card"
            :class="{ 'dragging': isDragging && draggedTemplate?.type === template.type }"
            elevation="1"
            hover
          >
            <v-card-text class="text-center pa-3">
              <v-icon :icon="template.icon" size="24" color="primary" class="mb-2" />
              <div class="text-caption font-weight-medium">
                {{ template.label }}
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { formElementTemplates } from '../composables/useFormBuilder';
import type { FormElementTemplate } from '../types/form';

const isDragging = ref(false);
const draggedTemplate = ref<FormElementTemplate | null>(null);

const onDragStart = (event: DragEvent, template: FormElementTemplate) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'form-element',
      template
    }));
    event.dataTransfer.effectAllowed = 'copy';
  }
  isDragging.value = true;
  draggedTemplate.value = template;
};

const onDragEnd = () => {
  isDragging.value = false;
  draggedTemplate.value = null;
};
</script>

<style scoped>
.form-palette {
  height: fit-content;
  position: sticky;
  top: 20px;
}

.element-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.element-item {
  cursor: grab;
}

.element-item:active {
  cursor: grabbing;
}

.element-card {
  transition: all 0.2s ease;
  border-radius: 8px !important;
}

.element-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.element-card.dragging {
  opacity: 0.8;
  transform: rotate(2deg) scale(1.02);
}

@media (max-width: 960px) {
  .element-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>