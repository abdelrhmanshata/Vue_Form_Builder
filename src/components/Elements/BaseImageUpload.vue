<template>
  <div>
    <v-file-input
      v-model="internalValue"
      :placeholder="element.placeholder"
      :required="element.required"
      :multiple="element.multiple"
      :rules="computedRules"
      prepend-icon=""
      prepend-inner-icon="mdi-image-plus"
      accept="image/*"
      color="primary"
      icon-color="primary"
      variant="outlined"
      density="comfortable"
      show-size
      clearable
      counter
      chips
      :counter-value="counterValue"
      @click:clear="clearAllPreviews"
    >
      <template #label>
        <span>
          <span v-if="element.required" class="text-red-500">*</span>
          {{ element.label }}
          <span v-if="element.maxFiles" class="text-caption text-grey">
            (Max {{ element.maxFiles }} files)
          </span>
        </span>
      </template>
    </v-file-input>

    <!-- Image Previews -->
    <div v-if="previews.length" class="d-flex flex-wrap gap-3">
      <div v-for="(url, index) in previews" :key="index" class="relative">
        <v-img
          :src="url"
          :width="56"
          :height="56"
          aspect-ratio="1/1"
          class="rounded-sm elevation-2"
          cover
        ></v-img>
        <v-btn
          icon
          size="small"
          color="red"
          density="compact"
          class="absolute top-0 right-0 m-1"
          @click="removeImage(index)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="image-preview">
      <v-icon icon="mdi-image" size="48" color="grey-lighten-2" />
      <p class="text-caption text-grey-lighten-1 mt-2">Image Upload</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from "vue";

interface ElementProps {
  id: string | number;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  multiple?: boolean;
  maxFiles?: number;
}

const props = defineProps<{
  element: ElementProps;
  modelValue?: File | File[] | null;
  rules?: Array<(v: any) => boolean | string>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: File | File[] | null): void;
}>();

// Internal state
const internalValue = ref(props.modelValue);
const previews = ref<string[]>([]);
const maxFilesExceeded = ref(true);

// Counter value for file input
const counterValue = (files: File[]) => {
  if (!props.element.multiple || !props.element.maxFiles) return files.length;
  return `${files.length} / ${props.element.maxFiles}`;
};

// Enhanced rules with max files validation
const computedRules = computed(() => {
  const rules = props.rules ? [...props.rules] : [];

  if (props.element.required) {
    rules.push((v: File | File[] | null) => {
      if (!v) return "This field is required";
      if (Array.isArray(v) && v.length === 0) return "This field is required";
      return true;
    });
  }

  // Add max files rule if specified
  if (props.element.multiple && props.element.maxFiles) {
    rules.push((v: File | File[] | null) => {
      if (!v) return true;
      const fileCount = Array.isArray(v) ? v.length : 1;
      return (
        fileCount <= props.element.maxFiles! ||
        `Maximum ${props.element.maxFiles} files allowed`
      );
    });
  }

  return rules;
});

// Generate previews from files
const generatePreviews = (files: File | File[] | null | undefined) => {
  // Clean up existing previews
  clearAllPreviews();

  if (!files) {
    previews.value = [];
    maxFilesExceeded.value = false;
    return;
  }

  const fileArray = Array.isArray(files) ? files : [files];

  // Check if max files exceeded
  if (
    props.element.multiple &&
    props.element.maxFiles &&
    fileArray.length > props.element.maxFiles
  ) {
    maxFilesExceeded.value = true;

    // Automatically hide warning after 5 seconds
    setTimeout(() => {
      maxFilesExceeded.value = false;
    }, 5000);
  } else {
    maxFilesExceeded.value = false;
  }

  // Apply max files limit if specified
  let limitedFiles = fileArray;
  if (props.element.multiple && props.element.maxFiles) {
    limitedFiles = fileArray.slice(0, props.element.maxFiles);

    // If we had to limit files, update the internal value
    if (limitedFiles.length !== fileArray.length) {
      internalValue.value = props.element.multiple ? limitedFiles : limitedFiles[0];
      return; // Exit early as the watch will trigger again
    }
  }

  // Filter out non-file objects and create previews
  previews.value = limitedFiles
    .filter((file) => file instanceof File)
    .map((file) => URL.createObjectURL(file));
};

// Remove a specific image
const removeImage = (index: number) => {
  if (previews.value[index]) {
    URL.revokeObjectURL(previews.value[index]);
  }

  previews.value.splice(index, 1);
  maxFilesExceeded.value = false; // Hide warning when files are removed

  // Update the internal value
  if (Array.isArray(internalValue.value)) {
    internalValue.value.splice(index, 1);
    if (internalValue.value.length === 0) {
      internalValue.value = null;
    }
  } else {
    internalValue.value = null;
  }

  emit("update:modelValue", internalValue.value);
};

// Clear all previews
const clearAllPreviews = () => {
  previews.value.forEach((url) => URL.revokeObjectURL(url));
  previews.value = [];
  maxFilesExceeded.value = false;
};

// Update from parent
watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val;
    generatePreviews(val);
  },
  { immediate: true }
);

// Update to parent and generate previews
watch(internalValue, (val) => {
  emit("update:modelValue", val);
  generatePreviews(val);
});

// Clean up on component unmount
onUnmounted(() => {
  clearAllPreviews();
});
</script>

<style scoped>
.image-preview {
  text-align: center;
  padding: 16px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.relative {
  position: relative;
}
.absolute {
  position: absolute;
}
.top-0 {
  top: 0;
}
.right-0 {
  right: 0;
}
.m-1 {
  margin: 0.25rem;
}
.gap-4 {
  gap: 1rem;
}
</style>
