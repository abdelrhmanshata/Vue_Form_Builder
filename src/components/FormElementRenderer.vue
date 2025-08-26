<template>
  <div
    class="form-element-wrapper"
    :class="{
      selected: isSelected,
      dragging: isDragging,
      [`width-${element.width}`]: true,
    }"
    @click="$emit('select', element)"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="element-controls" v-if="isSelected">
      <v-btn
        icon="mdi-content-duplicate"
        size="x-small"
        variant="text"
        color="primary"
        @click.stop="$emit('duplicate', element.id)"
      />
      <v-btn
        icon="mdi-delete"
        size="x-small"
        variant="text"
        color="error"
        @click.stop="$emit('delete', element.id)"
      />
    </div>

    <div class="form-element">
      <!-- Text Input -->
      <BaseTextField
        v-if="['text', 'email', 'number', 'date'].includes(element.type)"
        :element="element"
      />
      <!-- Textarea -->
      <BaseTextArea v-else-if="element.type === 'textarea'" :element="element" />

      <!-- Date Picker -->
      <BaseDatePicker v-else-if="element.type === 'date_picker'" :element="element" />

      <!-- Select -->
      <v-select
        v-else-if="element.type === 'select'"
        :label="element.label"
        :items="element.options || []"
        :required="element.required"
        variant="outlined"
        class="preview-field"
        readonly
        clearable
      />

      <!-- Multi Select -->
      <v-select
        v-else-if="element.type === 'multiselect'"
        :label="element.label"
        :items="element.options || []"
        :required="element.required"
        variant="outlined"
        class="preview-field"
        readonly
        multiple
        chips
      />

      <!-- Radio Buttons -->
      <div v-else-if="element.type === 'radio'" class="radio-group">
        <label class="field-label">
          {{ element.label }}
          <span v-if="element.required" class="required">*</span>
        </label>
        <v-radio-group readonly class="preview-field">
          <v-radio
            v-for="option in element.options || []"
            :key="option"
            :label="option"
            :value="option"
            disabled
          />
        </v-radio-group>
      </div>

      <!-- Checkboxes -->
      <div v-else-if="element.type === 'checkbox'" class="checkbox-group">
        <label class="field-label">
          {{ element.label }}
          <span v-if="element.required" class="required">*</span>
        </label>
        <div class="checkbox-options">
          <v-checkbox
            v-for="option in element.options || []"
            :key="option"
            :label="option"
            :value="option"
            disabled
            class="preview-field"
          />
        </div>
      </div>

      <!-- Image -->
      <div v-else-if="element.type === 'image'" class="image-group">
        <label class="field-label">
          {{ element.label }}
          <span v-if="element.required" class="required">*</span>
        </label>
        <div class="image-preview">
          <v-icon icon="mdi-image" size="48" color="grey-lighten-2" />
          <p class="text-caption text-grey-lighten-1 mt-2">Image Upload</p>
        </div>
      </div>

      <!-- File Upload -->
      <div v-else-if="element.type === 'file'" class="file-group">
        <label class="field-label">
          {{ element.label }}
          <span v-if="element.required" class="required">*</span>
        </label>
        <div class="file-preview">
          <v-icon icon="mdi-file-upload" size="48" color="grey-lighten-2" />
          <p class="text-caption text-grey-lighten-1 mt-2">File Upload</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FormElement } from "../types/form";
import BaseTextField from "./Elements/BaseTextField.vue";
import BaseTextArea from "./Elements/BaseTextArea.vue";
import BaseDatePicker from "./Elements/BaseDatePicker.vue";

interface Props {
  element: FormElement;
  isSelected: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [element: FormElement];
  duplicate: [elementId: string];
  delete: [elementId: string];
  "drag-start": [elementId: string];
  "drag-end": [];
}>();

const isDragging = ref(false);

const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "form-element-move",
        elementId: props.element.id,
      })
    );
    event.dataTransfer.effectAllowed = "move";
  }
  isDragging.value = true;
  emit("drag-start", props.element.id);
};

const onDragEnd = () => {
  isDragging.value = false;
  emit("drag-end");
};
</script>

<style scoped>
.form-element-wrapper {
  position: relative;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: fit-content;
}

.form-element-wrapper:hover {
  border-color: #e3f2fd;
  background-color: #fafafa;
}

.form-element-wrapper.selected {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.form-element-wrapper.dragging {
  opacity: 0.8;
  transform: rotate(1deg) scale(1.01);
  z-index: 1000;
}

/* Grid column spans for different widths */
.form-element-wrapper.width-full {
  grid-column: span 12;
}

.form-element-wrapper.width-half {
  grid-column: span 6;
}

.form-element-wrapper.width-third {
  grid-column: span 4;
}

.form-element-wrapper.width-quarter {
  grid-column: span 3;
}

.form-element-wrapper.width-two-thirds {
  grid-column: span 8;
}

/* Add visual indicators for width */
.form-element-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    #1976d2 0%,
    #1976d2 var(--width-percentage, 100%),
    transparent var(--width-percentage, 100%)
  );
  opacity: 0;
  transition: opacity 0.2s ease;
}

.form-element-wrapper:hover::before,
.form-element-wrapper.selected::before {
  opacity: 1;
}

.form-element-wrapper.width-full {
  --width-percentage: 100%;
}

.form-element-wrapper.width-two-thirds {
  --width-percentage: 66.67%;
}

.form-element-wrapper.width-half {
  --width-percentage: 50%;
}

.form-element-wrapper.width-third {
  --width-percentage: 33.33%;
}

.form-element-wrapper.width-quarter {
  --width-percentage: 25%;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .form-element-wrapper.width-half,
  .form-element-wrapper.width-third,
  .form-element-wrapper.width-quarter,
  .form-element-wrapper.width-two-thirds {
    grid-column: span 12;
  }
}

.element-controls {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  z-index: 10;
}

.form-element {
  pointer-events: none;
  width: 100%;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
}

.required {
  color: #f44336;
}

.radio-group,
.checkbox-group,
.image-group,
.file-group {
  margin-bottom: 16px;
}

.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.image-preview,
.file-preview {
  text-align: center;
  padding: 16px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.preview-field {
  pointer-events: none;
}

:deep(.v-input--disabled) {
  opacity: 0.8;
}

:deep(.v-field--disabled) {
  opacity: 0.8;
}
</style>
