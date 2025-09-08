<template>
  <v-select
    v-if="show"
    v-model="internalValue"
    :items="element.options || []"
    :required="element.required"
    :multiple="element.multiple"
    :rules="rules"
    :prepend-inner-icon="fieldIcon"
    color="primary"
    icon-color="primary"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    clearable
    chips
  >
    <template #label>
      <span>
        <span v-if="element.required" class="text-red-500">*</span>
        {{ element.label }}
      </span>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

interface ElementProps {
  id: string | number;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  multiple?: boolean;
}

const props = withDefaults(
  defineProps<{
    element: ElementProps;
    modelValue?: any;
    rules?: Array<(v: any) => boolean | string>;
    show?: boolean; // خليها optional
    formData?: any;
  }>(),
  {
    show: true, // Default Value
  }
);
const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

// internal state
const internalValue = ref(props.modelValue);

const fieldIcon = computed(() => {
  return props.element.multiple ? "mdi-select-multiple" : "mdi-select";
});

// update from parent
watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val;
  }
);

// update to parent
watch(internalValue, (val) => {
  emit("update:modelValue", val);
});
</script>
