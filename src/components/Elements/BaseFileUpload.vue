<template>
  <div v-if="show">
    <v-file-input
      v-model="internalValue"
      :required="element.required"
      :multiple="element.multiple"
      :rules="computedRules"
      prepend-icon=""
      prepend-inner-icon="mdi-file-plus"
      color="primary"
      icon-color="primary"
      variant="outlined"
      density="comfortable"
      :counter-value="counterValue"
      @update:modelValue="handleFileChange"
      @click:clear="clearAllFiles"
      hide-details="auto"
      show-size
      clearable
      counter
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

    <!-- File selection info -->
    <div v-if="selectedFiles.length" class="text-caption text-grey mt-1">
      {{ selectedFiles.length }} file(s) selected
      <span v-if="element.maxFiles">(max {{ element.maxFiles }})</span>
    </div>

    <!-- File list for all files -->
    <v-list
      v-if="allFiles.length"
      density="compact"
      class="mt-2 bg-grey-lighten-5 rounded-lg"
    >
      <v-list-item
        v-for="(file, index) in allFiles"
        :key="'file-' + index"
        class="mb-1"
      >
        <template #prepend>
          <v-icon :color="getFileIcon(file).color" size="small">
            {{ getFileIcon(file).icon }}
          </v-icon>
        </template>

        <v-list-item-title class="text-caption text-truncate">
          {{ file.name }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-caption">
          {{ formatFileSize(file.size) }} • {{ getFileType(file) }}
        </v-list-item-subtitle>

        <template #append>
          <v-btn
            icon
            size="small"
            color="red"
            density="compact"
            @click="removeFile(index)"
          >
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <!-- Empty State -->
    <div v-if="!allFiles.length" class="file-preview">
      <v-icon icon="mdi-file-upload" size="48" color="grey-lighten-2" />
      <p class="text-caption text-grey-lighten-1 mt-2">Upload files</p>
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
  accept?: string;
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
  (e: "update:modelValue", value: File | File[] | null): void;
}>();

// Internal state
const internalValue = ref<File[] | File | null | undefined>(
  props.modelValue ?? null
);
const allFiles = ref<File[]>([]);

// Computed properties
const selectedFiles = computed(() => {
  if (!internalValue.value) return [];
  return Array.isArray(internalValue.value)
    ? internalValue.value
    : [internalValue.value];
});

// Counter value for file input
const counterValue = (files: File[]) => {
  if (!props.element.multiple || !props.element.maxFiles) return files.length;
  return `${files.length} / ${props.element.maxFiles}`;
};

// Get file icon based on file type
const getFileIcon = (file: File): { icon: string; color: string } => {
  const type = file.type;

  if (type.startsWith("image/")) return { icon: "mdi-image", color: "blue" };

  if (type.startsWith("video/"))
    return { icon: "mdi-video", color: "deep-purple" };

  if (type.startsWith("audio/")) return { icon: "mdi-music", color: "pink" };

  if (type.includes("pdf")) return { icon: "mdi-file-pdf-box", color: "red" };

  if (type.includes("word") || type.includes("document"))
    return { icon: "mdi-microsoft-word", color: "blue-darken-2" };

  if (type.includes("excel") || type.includes("spreadsheet"))
    return { icon: "mdi-microsoft-excel", color: "green-darken-2" };

  if (type.includes("powerpoint") || type.includes("presentation"))
    return { icon: "mdi-microsoft-powerpoint", color: "orange" };

  if (type.includes("zip") || type.includes("compressed"))
    return { icon: "mdi-folder-zip", color: "brown" };

  if (type.includes("text"))
    return { icon: "mdi-file-document", color: "grey" };

  return { icon: "mdi-file", color: "grey-darken-1" };
};

// Get human-readable file type
const getFileType = (file: File): string => {
  const type = file.type;
  if (!type || type === "application/octet-stream") {
    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    return `${extension} File`;
  }

  return (
    type.split("/")[1]?.toUpperCase() ||
    type.split("/")[0]?.toUpperCase() ||
    "File"
  );
};

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  // Optional: File type validation if accept property is specified
  if (props.element.accept) {
    rules.push((v: File | File[] | null) => {
      if (!v) return true;

      const files = Array.isArray(v) ? v : [v];
      const acceptedTypes =
        props.element.accept?.split(",").map((type) => type.trim()) || [];

      const invalidFiles = files.filter((file) => {
        // Check if file type matches any accepted type
        return !acceptedTypes.some((acceptedType) => {
          if (acceptedType.includes("*")) {
            // Wildcard matching (e.g., image/*)
            const category = acceptedType.split("/")[0];
            return file.type.startsWith(category + "/");
          }
          // Exact type matching
          return file.type === acceptedType;
        });
      });

      if (invalidFiles.length > 0) {
        return `Only ${props.element.accept} files are allowed`;
      }

      return true;
    });
  }

  return rules;
});

// Handle file change
const handleFileChange = (files: File[] | File | null) => {
  if (!files) {
    clearAllFiles();
    internalValue.value = null;
    return;
  }

  const fileArray = Array.isArray(files) ? files : [files];

  // Apply max files limit if specified
  let limitedFiles = fileArray;
  if (props.element.multiple && props.element.maxFiles) {
    limitedFiles = fileArray.slice(0, props.element.maxFiles);
  }

  internalValue.value = props.element.multiple ? limitedFiles : limitedFiles[0];
  allFiles.value = limitedFiles;
};

// Remove a file
const removeFile = (index: number) => {
  allFiles.value.splice(index, 1);

  // Update internal value
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

// Clear all files
const clearAllFiles = () => {
  allFiles.value = [];
  internalValue.value = null;
  emit("update:modelValue", null);
};

// Update from parent
watch(
  () => props.modelValue,
  (val) => {
    if (val !== internalValue.value) {
      internalValue.value = val;
      if (val) {
        const files = Array.isArray(val) ? val : [val];
        allFiles.value = files;
      } else {
        allFiles.value = [];
      }
    }
  },
  { immediate: true }
);

// Clean up on component unmount
onUnmounted(() => {
  clearAllFiles();
});
</script>

<style scoped>
.file-preview {
  text-align: center;
  padding: 16px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
