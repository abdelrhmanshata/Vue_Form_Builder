<template>
  <v-textarea
    v-model="internalValue"
    :type="element.type"
    :placeholder="element.placeholder"
    :required="element.required"
    :rules="rules"
    prepend-inner-icon="mdi-form-textarea"
    color="primary"
    icon-color="primary"
    variant="outlined"
    density="comfortable"
    rows="4"
    clearable
  >
    <template #label>
      <span>
        <span v-if="element.required" class="text-red-500">*</span>
        {{ element.label }}
      </span>
    </template>
  </v-textarea>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface ElementProps {
  id: string | number;
  type: string;
  label?: string;
  placeholder?: string;
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
