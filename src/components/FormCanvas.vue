<template>
  <v-card class="form-canvas" elevation="2">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon icon="mdi-form-select" class="mr-2" />
        <p class="text-wrap">Form Canvas</p>
        <v-chip v-if="elements.length > 0" size="small" color="primary" class="mx-2">
          {{ elements.length }} elements
        </v-chip>
      </div>
      <div class="d-flex align-center ga-2">
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              @click="$emit('preview')"
              :disabled="elements.length === 0"
            />
          </template>
          <span>Preview Form</span>
        </v-tooltip>

        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-code-tags"
              size="small"
              variant="text"
              color="secondary"
              @click="$emit('export')"
              :disabled="elements.length === 0"
            />
          </template>
          <span>Export Form</span>
        </v-tooltip>
      </div>
    </v-card-title>

    <v-card-text class="canvas-content">
      <!-- Form Header -->
      <div class="form-header mb-5">
        <v-text-field
          :model-value="form?.title"
          label="Form Title"
          variant="outlined"
          class="mb-2"
          @update:model-value="updateTitle"
          :hint="'This will be displayed at the top of your form'"
          persistent-hint
        />
        <v-textarea
          :model-value="form?.description"
          label="Form Description"
          variant="outlined"
          rows="2"
          @update:model-value="updateDescription"
          :hint="'Optional description for your form'"
          persistent-hint
        />
      </div>

      <!-- Drop Zone -->
      <div
        class="drop-zone"
        :class="{
          'drag-over': isDragOver,
          empty: elements.length === 0,
          'has-elements': elements.length > 0,
        }"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <div v-if="elements.length === 0" class="empty-state">
          <v-icon icon="mdi-drag" size="48" color="grey-lighten-2" class="mb-3" />
          <h3 class="text-h6 mb-2 text-grey-darken-1">Drag elements here</h3>
          <p class="text-body-2 text-grey-lighten-1 text-center">
            Start building your form by dragging elements<br />from the palette on the
            left
          </p>
        </div>

        <div v-else class="form-grid">
          <template v-for="(row, rowIndex) in elementRows" :key="`row-${rowIndex}`">
            <div class="form-row" :class="`row-${rowIndex}`">
              <FormElementRenderer
                v-for="element in row"
                :key="element.id"
                :element="element"
                :is-selected="selectedElement?.id === element.id"
                @select="$emit('select-element', element)"
                @duplicate="$emit('duplicate-element', element.id)"
                @delete="$emit('delete-element', element.id)"
                @drag-start="onElementDragStart"
                @drag-end="onElementDragEnd"
              />
            </div>
          </template>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import FormElementRenderer from "@/components/FormElementRenderer.vue";
import type { FormElement, FormConfig, FormElementTemplate } from "@/types/form";

interface Props {
  form: FormConfig | null;
  elements: FormElement[];
  selectedElement: FormElement | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "add-element": [template: FormElementTemplate, position?: number];
  "move-element": [elementId: string, newPosition: number];
  "select-element": [element: FormElement];
  "duplicate-element": [elementId: string];
  "delete-element": [elementId: string];
  "update-title": [title: string];
  "update-description": [description: string];
  preview: [];
  export: [];
}>();

const isDragOver = ref(false);
const draggedElementId = ref<string | null>(null);

// Group elements into rows based on width and newRow property
const elementRows = computed(() => {
  const rows: FormElement[][] = [];
  let currentRow: FormElement[] = [];
  let currentRowWidth = 0;

  const getElementWidth = (width: string) => {
    const widthMap = {
      full: 12,
      "two-thirds": 8,
      half: 6,
      third: 4,
      quarter: 3,
    };
    return widthMap[width as keyof typeof widthMap] || 12;
  };

  props.elements.forEach((element) => {
    const elementWidth = getElementWidth(element.width);

    // Start new row if:
    // 1. Element has newRow flag
    // 2. Adding this element would exceed 12 columns
    // 3. Current row is empty and this is the first element
    if (
      element.newRow ||
      currentRowWidth + elementWidth > 12 ||
      (currentRow.length === 0 && rows.length === 0)
    ) {
      if (currentRow.length > 0) {
        rows.push([...currentRow]);
        currentRow = [];
        currentRowWidth = 0;
      }
    }

    currentRow.push(element);
    currentRowWidth += elementWidth;

    // If this element fills the row completely, start a new row
    if (currentRowWidth >= 12) {
      rows.push([...currentRow]);
      currentRow = [];
      currentRowWidth = 0;
    }
  });

  // Add any remaining elements in the current row
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
});

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const onDragLeave = (event: DragEvent) => {
  if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
    isDragOver.value = false;
  }
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  if (event.dataTransfer) {
    try {
      const data = JSON.parse(event.dataTransfer.getData("application/json"));

      if (data.type === "form-element" && data.template) {
        // Calculate drop position based on mouse position
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const y = event.clientY - rect.top;
        const elementHeight = 80; // Approximate height of form elements
        const position = Math.floor(y / elementHeight);

        emit("add-element", data.template, Math.min(position, props.elements.length));
      } else if (data.type === "form-element-move" && data.elementId) {
        // Handle moving existing elements
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const y = event.clientY - rect.top;
        const elementHeight = 80;
        const newPosition = Math.floor(y / elementHeight);

        emit(
          "move-element",
          data.elementId,
          Math.min(newPosition, props.elements.length - 1)
        );
      }
    } catch (error) {
      console.warn("Failed to parse drop data:", error);
    }
  }
};

const onElementDragStart = (elementId: string) => {
  draggedElementId.value = elementId;
};

const onElementDragEnd = () => {
  draggedElementId.value = null;
};

const updateTitle = (title: string) => {
  emit("update-title", title);
};

const updateDescription = (description: string) => {
  emit("update-description", description);
};
</script>

<style scoped>
.form-canvas {
  min-height: 600px;
  height: 100%;
}

.canvas-content {
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}

.drop-zone {
  flex: 1;
  /* min-height: 500px; */
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
}

.drop-zone.drag-over {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
  transform: scale(1.01);
}

.drop-zone.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.drop-zone.has-elements {
  background-color: white;
  border-style: solid;
  border-color: #f0f0f0;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #9e9e9e;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  align-items: start;
  min-height: 80px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  background-color: #f8f9fa;
}

.form-row:hover {
  background-color: #e3f2fd;
}

.canvas-footer {
  border-top: 1px solid #e0e0e0;
  padding: 8px;
  margin: 16px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .drop-zone {
    padding: 16px;
  }
}
</style>
