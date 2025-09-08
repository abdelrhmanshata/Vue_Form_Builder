<template>
  <div v-if="show" class="d-flex flex-column">
    <v-label>
      <span v-if="element.required" class="text-red-500">*</span>
      {{ element.label || "Select Date" }}
    </v-label>

    <v-date-picker
      v-model="internalValue"
      :multiple="element.multiple"
      :min="element.validation?.minDate"
      :max="element.validation?.maxDate"
      elevation="24"
      color="primary"
      hide-details="auto"
      show-adjacent-months
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { FormValidation } from "@/types/form";

interface ElementProps {
  id: string | number;
  label?: string;
  required?: boolean;
  multiple?: boolean;
  validation?: FormValidation;
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
