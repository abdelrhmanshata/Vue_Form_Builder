<template>
  <v-card class="form-palette" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-palette" class="mr-2" />
      Form Elements
      <v-chip size="small" color="primary" class="ml-2">
        {{ formElementTemplates.length }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-3">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search elements..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        class="mb-3"
        clearable
      />

      <div class="element-categories">
        <v-chip
          v-for="category in categories"
          :key="category"
          :color="activeCategory === category ? 'primary' : undefined"
          variant="outlined"
          size="small"
          class="mr-1 mb-2"
          @click="activeCategory = activeCategory === category ? 'All' : category"
        >
          {{ category }}
        </v-chip>
      </div>

      <div class="element-grid">
        <div
          v-for="template in filteredTemplates"
          :key="template.type"
          class="element-item"
          draggable="true"
          @dragstart="onDragStart($event, template)"
          @dragend="onDragEnd"
        >
          <v-card
            class="element-card"
            :class="{ dragging: isDragging && draggedTemplate?.type === template.type }"
            elevation="1"
            hover
          >
            <v-card-text class="text-center pa-3">
              <v-icon :icon="template.icon" size="24" color="primary" class="mb-2" />
              <div class="text-caption font-weight-medium">
                {{ template.label }}
              </div>
              <div class="text-caption text-grey mt-1">
                {{ getCategory(template.type) }}
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

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
const activeCategory = ref<string | null>("All");

const categories = computed(() => {
  const uniqueCategories = new Set();
  formElementTemplates.forEach((template) => {
    uniqueCategories.add(getCategory(template.type));
  });
  return Array.from(["All", ...uniqueCategories]);
});

const filteredTemplates = computed(() => {
  if (activeCategory.value == "All") return formElementTemplates;
  return formElementTemplates.filter((template) => {
    const matchesSearch =
      template.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      template.type.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory =
      !activeCategory.value || getCategory(template.type) === activeCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const getCategory = (type: string) => {
  const categoryMap: Record<string, string> = {
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
    image: "Media",
    file: "Media",
  };
  return categoryMap[type] || "Other";
};

const onDragStart = (event: DragEvent, template: FormElementTemplate) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "form-element",
        template,
      })
    );
    event.dataTransfer.effectAllowed = "copy";

    // Set drag image
    const dragImage = document.createElement("div");
    dragImage.textContent = template.label;
    dragImage.style.position = "absolute";
    dragImage.style.background = "rgba(25, 118, 210, 0.9)";
    dragImage.style.color = "white";
    dragImage.style.padding = "8px 12px";
    dragImage.style.borderRadius = "4px";
    dragImage.style.fontSize = "14px";
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
  height: fit-content;
  position: sticky;
  max-height: 100vh;
  overflow-y: auto;
}

.element-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.element-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.element-item {
  cursor: grab;
  transition: transform 0.2s ease;
}

.element-item:active {
  cursor: grabbing;
}

.element-item:hover {
  transform: translateY(-2px);
}

.element-card {
  transition: all 0.2s ease;
  border-radius: 8px !important;
  height: 100%;
}

.element-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.element-card.dragging {
  opacity: 0.6;
  transform: scale(0.95);
}

@media (max-width: 960px) {
  .element-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .element-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
