<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title class="d-flex align-center">
        <v-icon icon="mdi-form-select" class="mr-2" />
        Form Builder
        <v-chip
          v-if="currentForm"
          size="small"
          color="white"
          text-color="primary"
          class="ml-2"
        >
          {{ currentForm.elements.length }} elements
        </v-chip>
      </v-app-bar-title>

      <v-spacer />

      <!-- إضافة عناصر التحكم في التاريخ هنا -->
      <HistoryControls
        v-if="currentForm"
        :can-undo="canUndo"
        :can-redo="canRedo"
        @undo="undo"
        @redo="redo"
        class="mr-2"
      />

      <div class="d-flex align-center ga-2">
        <v-btn
          prepend-icon="mdi-plus"
          variant="outlined"
          class="text-white border-white"
          @click="createForm"
        >
          New Form
        </v-btn>

        <v-menu>
          <template v-slot:activator="{ props: menuProps }">
            <v-btn icon="mdi-dots-vertical" v-bind="menuProps" color="white" />
          </template>
          <v-list>
            <v-list-item
              @click="showPreview = true"
              :disabled="!currentForm || currentForm.elements.length === 0"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-eye" />
              </template>
              <v-list-item-title>Preview Form</v-list-item-title>
            </v-list-item>

            <v-list-item
              @click="exportForm"
              :disabled="!currentForm || currentForm.elements.length === 0"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-download" />
              </template>
              <v-list-item-title>Export HTML</v-list-item-title>
            </v-list-item>

            <v-list-item @click="exportConfig" :disabled="!currentForm">
              <template v-slot:prepend>
                <v-icon icon="mdi-code-json" />
              </template>
              <v-list-item-title>Export Config</v-list-item-title>
            </v-list-item>

            <v-divider />

            <v-list-item @click="showHelp">
              <template v-slot:prepend>
                <v-icon icon="mdi-help-circle" />
              </template>
              <v-list-item-title>Help & Documentation</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4 h-100">
        <v-row
          v-if="!currentForm"
          class="justify-center align-center"
          style="min-height: 70vh"
        >
          <v-col cols="12" md="6" lg="4" class="text-center">
            <v-icon
              icon="mdi-form-select"
              size="120"
              color="grey-lighten-2"
              class="mb-4"
            />
            <h2 class="text-h4 mb-4">Welcome to Form Builder</h2>
            <div class="text-body-1 mb-6 text-grey-darken-1">
              Create beautiful, functional forms with our drag-and-drop interface.
              <p class="mt-2">Start by creating a new form or loading an existing one.</p>
            </div>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-plus"
              @click="createForm"
              class="mb-4"
            >
              Create Your First Form
            </v-btn>

            <!-- <div class="features-grid">
              <v-row>
                <v-col cols="6" v-for="feature in features" :key="feature.title">
                  <div class="feature-item text-center">
                    <v-icon :icon="feature.icon" size="32" color="primary" class="mb-2" />
                    <div class="text-caption font-weight-medium">{{ feature.title }}</div>
                  </div>
                </v-col>
              </v-row>
            </div> -->
          </v-col>
        </v-row>

        <v-row v-else class="h-100">
          <!-- Element Palette -->
          <v-col cols="12" md="3" class="h-100">
            <FormElementPalette />
          </v-col>

          <!-- Form Canvas -->
          <v-col cols="12" md="6" class="h-100">
            <FormCanvas
              :form="currentForm"
              :elements="currentFormElements"
              :selected-element="selectedElement"
              @add-element="handleAddElement"
              @move-element="handleMoveElement"
              @select-element="handleSelectElement"
              @duplicate-element="handleDuplicateElement"
              @delete-element="handleDeleteElement"
              @update-title="handleUpdateTitle"
              @update-description="handleUpdateDescription"
              @preview="showPreview = true"
              @export="exportForm"
            />
          </v-col>

          <!-- Properties Panel -->
          <v-col cols="12" md="3" class="h-100">
            <FormElementProperties
              :element="selectedElement"
              :available-elements="currentFormElements"
              @update-element="handleUpdateElement"
              @delete-element="handleDeleteSelectedElement"
              @duplicate-element="handleDuplicateSelectedElement"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Form Preview Dialog -->
    <FormPreviewDialog v-model="showPreview" :form="currentForm" />

    <!-- Export Dialog -->
    <v-dialog v-model="showExportDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-code-tags" class="mr-2" />
          Export Form
          <v-chip size="small" color="primary" class="ml-2">
            {{ exportType }}
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-tabs v-model="exportTab" class="mb-4">
            <v-tab value="html">HTML</v-tab>
            <v-tab value="json">JSON</v-tab>
          </v-tabs>

          <v-window v-model="exportTab">
            <v-window-item value="html">
              <v-textarea
                :model-value="exportContent"
                label="Generated HTML"
                variant="outlined"
                rows="15"
                readonly
                class="code-textarea"
              />
            </v-window-item>
            <v-window-item value="json">
              <v-textarea
                :model-value="exportConfigContent"
                label="Form Configuration"
                variant="outlined"
                rows="15"
                readonly
                class="code-textarea"
              />
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="copyToClipboard">
            <v-icon icon="mdi-content-copy" class="mr-2" />
            Copy to Clipboard
          </v-btn>
          <v-btn variant="text" @click="showExportDialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2" />
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useFormBuilder } from "../composables/useFormBuilder";
import FormElementPalette from "../components/FormElementPalette.vue";
import FormCanvas from "../components/FormCanvas.vue";
import FormElementProperties from "../components/FormElementProperties.vue";
import FormPreviewDialog from "../components/FormPreviewDialog.vue";
import HistoryControls from "../components/HistoryControls.vue"; // تأكد من استيراد المكون
import type { FormElement, FormElementTemplate } from "../types/form";

const {
  currentForm,
  currentFormElements,  
  selectedElement,
  createNewForm,
  updateFormConfig,
  addElement,
  updateElement,
  removeElement,
  moveElement,
  duplicateElement,
  exportFormConfig,
  generateFormHTML,
  undo,
  redo,
  canUndo,
  canRedo,
} = useFormBuilder();

const showPreview = ref(false);
const showExportDialog = ref(false);
const exportTab = ref("html");
const exportContent = ref("");
const exportConfigContent = ref("");

const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
  icon: "mdi-check",
});

const features = [
  { icon: "mdi-drag", title: "Drag & Drop" },
  { icon: "mdi-responsive", title: "Responsive" },
  { icon: "mdi-preview", title: "Live Preview" },
  { icon: "mdi-export", title: "Export" },
  { icon: "mdi-validation", title: "Validation" },
  { icon: "mdi-link", title: "Dependencies" },
];

const exportType = computed(() => {
  return exportTab.value === "html" ? "HTML" : "JSON";
});

const createForm = () => {
  createNewForm();
  showSnackbar("New form created successfully", "success", "mdi-check");
};

const handleAddElement = (template: FormElementTemplate, position?: number) => {
  addElement(template, position);
  showSnackbar(`${template.label} added to form`, "success", "mdi-plus");
};

const handleMoveElement = (elementId: string, newPosition: number) => {
  moveElement(elementId, newPosition);
  showSnackbar("Element moved", "info", "mdi-drag");
};

const handleSelectElement = (element: FormElement) => {
  selectedElement.value = element;
};

const handleDuplicateElement = (elementId: string) => {
  duplicateElement(elementId);
  showSnackbar("Element duplicated", "success", "mdi-content-duplicate");
};

const handleDeleteElement = (elementId: string) => {
  removeElement(elementId);
  selectedElement.value = null;
  showSnackbar("Element deleted", "success", "mdi-delete");
};

const handleUpdateElement = (elementId: string, updates: Partial<FormElement>) => {
  updateElement(elementId, updates);
};

const handleDeleteSelectedElement = () => {
  if (selectedElement.value) {
    handleDeleteElement(selectedElement.value.id);
  }
};

const handleDuplicateSelectedElement = () => {
  if (selectedElement.value) {
    handleDuplicateElement(selectedElement.value.id);
  }
};

const handleUpdateTitle = (title: string) => {
  updateFormConfig({ title });
  showSnackbar("Form title updated", "info", "mdi-pencil");
};

const handleUpdateDescription = (description: string) => {
  updateFormConfig({ description });
  showSnackbar("Form description updated", "info", "mdi-pencil");
};

const exportForm = () => {
  exportContent.value = generateFormHTML();
  exportConfigContent.value = exportFormConfig() || "";
  exportTab.value = "html";
  showExportDialog.value = true;
};

const exportConfig = () => {
  exportConfigContent.value = exportFormConfig() || "";
  exportContent.value = generateFormHTML();
  exportTab.value = "json";
  showExportDialog.value = true;
};

const copyToClipboard = async () => {
  try {
    const text =
      exportTab.value === "html" ? exportContent.value : exportConfigContent.value;
    await navigator.clipboard.writeText(text);
    showSnackbar("Copied to clipboard", "success", "mdi-content-copy");
  } catch (error) {
    showSnackbar("Failed to copy to clipboard", "error", "mdi-alert");
  }
};

const showHelp = () => {
  showSnackbar("Documentation will be available soon", "info", "mdi-information");
};

const showSnackbar = (text: string, color: string, icon: string) => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.icon = icon;
  snackbar.show = true;
};
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.features-grid {
  margin-top: 32px;
}

.feature-item {
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background-color: #e3f2fd;
  transform: translateY(-2px);
}

.code-textarea :deep(.v-field__input) {
  font-family: "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
}

:deep(.v-tab) {
  min-width: 100px;
}
</style>
