<template>
  <div class="checkbox-group">
    <!-- Label -->
    <label class="field-label">
      <span v-if="element.required" class="text-red-500">*</span>
      {{ element.label }}
    </label>

    <!-- Checkbox Options -->
    <div class="checkbox-options" :class="{ inline: element.inline }">
      <v-checkbox
        v-for="option in element.options || []"
        :key="option"
        :label="option"
        :value="true"
        :model-value="modelValue?.[option] || false"
        @update:model-value="(val) => updateValue(option, val)"
        hide-details="auto"
        density="compact"
        color="primary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface ElementProps {
  id: string | number;
  type: string;
  label?: string;
  required?: boolean;
  inline?: boolean;
  options?: string[];
}

const props = defineProps<{
  element: ElementProps;
  modelValue?: Record<string, boolean>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, boolean>): void;
}>();

// ✅ computed modelValue for cleaner handling
const modelValue = computed(() => props.modelValue || {});

// ✅ update function
function updateValue(option: string, checked: boolean) {
  emit("update:modelValue", {
    ...modelValue.value,
    [option]: checked,
  });
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  padding-inline: 8px;
}
.checkbox-group {
  display: flex;
  flex-direction: column;
}
.checkbox-options {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
.checkbox-options.inline {
  flex-direction: row;
}
</style>
