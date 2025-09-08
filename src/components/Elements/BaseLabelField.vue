<template>
  <div class="flex flex-col mb-3">
    <h1 class="text-gray-600">{{ element.label }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { FormValidation, FormElementDependency } from "@/types/form";

interface ElementProps {
  id: string | number;
  type: string;
  label?: string;
  placeholder?: string;
  required: boolean;
  validation: FormValidation;
  dependencies: FormElementDependency[];
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
const iconByType: Record<string, string> = {
  text: "mdi-text-box-outline",
  email: "mdi-email-outline",
  number: "mdi-numeric",
  date: "mdi-calendar",
};

const fieldIcon = computed(() => {
  return iconByType[props.element.type] || "mdi-form-textbox";
});

//
const computedRules = computed(() => {
  const baseRules = props.rules ? [...props.rules] : [];
  const v = props.element.validation;

  if (!v) return baseRules;

  const validations: Array<(val: string) => true | string> = [];

  if (v.required) {
    validations.push((val) => !!val || "This field is required");
  }

  if (v.minLength) {
    validations.push(
      (val) =>
        (val && val.length >= v.minLength) || `Min ${v.minLength} characters`
    );
  }

  if (v.maxLength) {
    validations.push(
      (val) =>
        !val || val.length <= v.maxLength || `Max ${v.maxLength} characters`
    );
  }

  // if (v.pattern) {
  //   const regex = new RegExp(v.pattern);
  //   validations.push((val) => !val || regex.test(val) || "Invalid format");
  // }

  return [...baseRules, ...validations];
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
