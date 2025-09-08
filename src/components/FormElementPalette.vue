<template>
  <v-card class="form-palette" elevation="2">
    <!-- Header -->
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon icon="mdi-palette" class="mr-2" />
        Form Elements
      </div>
      <v-chip size="small" color="primary">
        {{ formElementTemplates.length }}
      </v-chip>
    </v-card-title>

    <!-- Body -->
    <v-card-text class="pa-3">
      <!-- Search -->
      <v-text-field
        v-model="searchQuery"
        placeholder="Search elements..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
      />

      <!-- Categories -->
      <div class="element-categories">
        <v-chip
          v-for="category in categories"
          :key="category"
          :color="activeCategory === category ? 'primary' : undefined"
          variant="outlined"
          size="small"
          @click="toggleCategory(category)"
        >
          {{ category }}
        </v-chip>
      </div>

      <!-- Elements Grid -->
      <div class="element-grid">
        <div
          v-for="template in filteredTemplates"
          :key="template.type"
          class="element-item"
          draggable="true"
          @dragstart="onDragStart($event, template)"
          @dragend="onDragEnd"
        >
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-card
              class="element-card"
              v-bind="hoverProps"
              :class="{
                dragging: isDragging && draggedTemplate?.type === template.type,
              }"
              :elevation="isHovering ? 5 : 1"
            >
              <v-card-text class="text-center pa-3">
                <v-icon :icon="template.icon" size="28" color="primary" class="mb-2" />
                <div class="text-caption font-weight-medium">
                  {{ template.label }}
                </div>
                <div class="text-caption text-grey mt-1">
                  {{ getCategory(template.type) }}
                </div>
              </v-card-text>
            </v-card>
          </v-hover>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTemplates.length === 0" class="text-center py-4">
        <v-icon icon="mdi-magnify-remove" size="32" color="grey-lighten-2" class="mb-2" />
        <p class="text-caption text-grey">No elements found</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { formElementTemplates } from "../composables/useFormBuilder";
import type { FormElementTemplate } from "../types/form";

const isDragging = ref(false);
const draggedTemplate = ref<FormElementTemplate | null>(null);
const searchQuery = ref("");
const activeCategory = ref<string>("All");

// Categories
const categories = computed(() => {
  const unique = new Set<string>();
  formElementTemplates.forEach((t) => unique.add(getCategory(t.type)));
  return ["All", ...Array.from(unique)];
});

// Filter
const filteredTemplates = computed(() =>
  formElementTemplates.filter((t) => {
    const matchesSearch =
      t.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory =
      activeCategory.value === "All" || getCategory(t.type) === activeCategory.value;
    return matchesSearch && matchesCategory;
  })
);

// Helpers
const toggleCategory = (category: string) => {
  activeCategory.value = activeCategory.value === category ? "All" : category;
};

const getCategory = (type: string) => {
  const map: Record<string, string> = {
    label: "Input Fields",
    text: "Input Fields",
    email: "Input Fields",
    password: "Input Fields",
    number: "Input Fields",
    textarea: "Input Fields",
    date: "Input Fields",
    date_picker: "Input Fields",
    select: "Selection",
    auto_select: "Selection",
    radio: "Selection",
    checkbox: "Selection",
    upload_image: "Media",
    upload_file: "Media",
    image: "Media",
  };
  return map[type] || "Other";
};

// Drag events
const onDragStart = (event: DragEvent, template: FormElementTemplate) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "form-element", template })
    );
    event.dataTransfer.effectAllowed = "copy";

    const dragImage = document.createElement("div");
    dragImage.textContent = template.label;
    dragImage.style.cssText = `
      position: absolute;
      background: rgba(25, 118, 210, 0.9);
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 13px;
    `;
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, -10, -10);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }
  isDragging.value = true;
  draggedTemplate.value = template;
};

const onDragEnd = () => {
  isDragging.value = false;
  draggedTemplate.value = null;
};
</script>

<style scoped>
.form-palette {
  position: sticky;
  top: 16px;
  max-height: 100vh;
  overflow-y: auto;
  border-radius: 12px;
}

.element-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.element-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.element-item {
  cursor: grab;
  transition: transform 0.2s ease;
}
.element-item:active {
  cursor: grabbing;
}

.element-card {
  transition: all 0.25s ease;
  border-radius: 10px !important;
}

/* .element-card:hover {
  background-color: red;
} */

.element-card.dragging {
  opacity: 0.6;
  transform: scale(0.95);
}
</style>
