<template>
  <div class="d-flex justify-center">
    <v-date-picker color="primary"></v-date-picker>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface ElementProps {
  id: string | number;
  label?: string;
  required?: boolean;
}

const props = defineProps<{
  element: ElementProps;
  modelValue?: any;
  rules?: Array<(v: any) => boolean | string>;
}>();

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
