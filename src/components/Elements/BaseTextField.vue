<template>
  <v-text-field
    v-model="internalValue"
    :type="element.type"
    :placeholder="element.placeholder"
    :required="element.required"
    :rules="rules"
    :prepend-inner-icon="fieldIcon"
    color="primary"
    icon-color="primary"
    variant="outlined"
    density="comfortable"
    clearable
  >
    <template #label>
      <span>
        <span v-if="element.required" class="text-red-500">*</span>
        {{ element.label }}
      </span>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

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
  rules?: Array<(v: any) => true | string>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

// internal state
const internalValue = ref(props.modelValue);
const iconByType: Record<string, string> = {
  text: "mdi-text-box-outline",
  email: "mdi-email-outline",
  number: "mdi-numeric",
  date: "mdi-calendar",
};

const fieldIcon = computed(() => {
  return iconByType[props.element.type] || "mdi-form-textbox";
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
