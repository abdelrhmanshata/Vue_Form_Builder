<template>
  <div>
    <v-radio-group v-model="internalValue" :inline="element.inline" color="primary">
      <template #label>
        <div class="flex items-center gap-2">
          <span>
            <span v-if="element.required" class="text-red-500">*</span>
            {{ element.label }}
          </span>

          <v-btn
            v-if="internalValue"
            icon="mdi-close-circle"
            size="small"
            color="gray"
            variant="text"
            @click.stop="clearSelection"
          />
        </div>
      </template>

      <v-radio
        v-for="option in element.options || []"
        :key="option"
        :label="option"
        :value="option"
        density="compact"
      />
    </v-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

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
  modelValue?: any;
  rules?: Array<(v: any) => boolean | string>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

const internalValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val;
  }
);

watch(internalValue, (val) => {
  emit("update:modelValue", val);
});

const clearSelection = () => {
  internalValue.value = null;
};
</script>
