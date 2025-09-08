<template>
  <div v-if="show">
    <v-img
      class="rounded-md elevation-2 border"
      v-if="preview"
      :src="preview"
      :width="element.w_image"
      :height="element.h_image"
      hide-details="auto"
      cover
      @error="handleError"
    >
      <!-- Error State -->
      <template #error>
        <div class="image-fallback">
          <v-icon icon="mdi-image-off" size="48" color="grey-lighten-2" />
          <p class="text-caption text-grey-lighten-1 mt-2">Image Not Found</p>
        </div>
      </template>
    </v-img>
    <div v-else class="flex-1 image-preview">
      <v-icon icon="mdi-image" size="48" color="grey-lighten-2" />
      <p class="text-caption text-grey-lighten-1 mt-2">No Image</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";

interface ElementProps {
  id: string | number;
  type: string;
  file?: any;
  url?: string;
  src?: string;
  w_image?: string;
  h_image?: string;
}

const props = withDefaults(
  defineProps<{
    element: ElementProps;
    modelValue?: File | null;
    width?: string | number;
    height?: string | number;
    aspectRatio?: string | number;
    cover?: boolean;
    rules?: Array<(v: any) => boolean | string>;
    show?: boolean; // خليها optional
    formData?: any;
  }>(),
  {
    show: true, // Default Value
  }
);

// state
const preview = ref<string | null>(null);

const generatePreview = (file: File | null | undefined) => {
  clearPreview();
  if (file instanceof File) {
    preview.value = URL.createObjectURL(file);
  } else {
    preview.value = null;
  }
};

// Clear preview
const clearPreview = () => {
  if (preview.value) {
    URL.revokeObjectURL(preview.value);
    preview.value = null;
  }
};

const handleError = () => {
  preview.value = null;
};

// watchers
watch(
  () => props.element,
  (val) => {
    if (val?.file) {
      generatePreview(val.file);
    } else if (val?.url) {
      preview.value = val.url;
    } else {
      preview.value = null;
    }
  },
  { deep: true }
);

//
onMounted(() => {
  const { file, url } = props.element || {};
  if (file) {
    generatePreview(file);
  } else if (url) {
    preview.value = url;
  }
});
// cleanup
onUnmounted(() => {
  clearPreview();
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
.image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #fafafa;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}
</style>
