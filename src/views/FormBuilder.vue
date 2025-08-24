<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>
        <v-icon icon="mdi-form-select" class="mr-2" />
        Form Builder
      </v-app-bar-title>
      
      <v-spacer />
      
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
            <v-btn
              icon="mdi-dots-vertical"
              v-bind="menuProps"
            />
          </template>
          <v-list>
            <v-list-item @click="showPreview = true" :disabled="!currentForm">
              <v-list-item-title>
                <v-icon start>mdi-eye</v-icon>
                Preview Form
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportForm" :disabled="!currentForm">
              <v-list-item-title>
                <v-icon start>mdi-download</v-icon>
                Export HTML
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportConfig" :disabled="!currentForm">
              <v-list-item-title>
                <v-icon start>mdi-code-json</v-icon>
                Export Config
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <v-row v-if="!currentForm" class="justify-center align-center" style="min-height: 60vh;">
          <v-col cols="12" md="6" class="text-center">
            <v-icon icon="mdi-form-select" size="120" color="grey-lighten-2" class="mb-4" />
            <h2 class="text-h4 mb-4">Welcome to Form Builder</h2>
            <p class="text-body-1 mb-6 text-grey-darken-1">
              Create beautiful, functional forms with our drag-and-drop interface.
              Start by creating a new form or loading an existing one.
            </p>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-plus"
              @click="createForm"
            >
              Create Your First Form
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-else>
          <!-- Element Palette -->
          <v-col cols="12" md="3">
            <FormElementPalette />
          </v-col>

          <!-- Form Canvas -->
          <v-col cols="12" md="6">
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
          <v-col cols="12" md="3">
            <FormElementProperties
              :element="selectedElement"
              @update-element="handleUpdateElement"
              @delete-element="handleDeleteSelectedElement"
              @duplicate-element="handleDuplicateSelectedElement"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Form Preview Dialog -->
    <FormPreviewDialog
      v-model="showPreview"
      :form="currentForm"
    />

    <!-- Export Dialog -->
    <v-dialog v-model="showExportDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <v-icon icon="mdi-code-tags" class="mr-2" />
          Export Form
        </v-card-title>
        <v-card-text>
          <v-textarea
            :model-value="exportContent"
            label="Generated Code"
            variant="outlined"
            rows="20"
            readonly
            class="code-textarea"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="copyToClipboard"
          >
            Copy to Clipboard
          </v-btn>
          <v-btn
            variant="text"
            @click="showExportDialog = false"
          >
            Close
          </v-btn>
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
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useFormBuilder } from '../composables/useFormBuilder';
import FormElementPalette from '../components/FormElementPalette.vue';
import FormCanvas from '../components/FormCanvas.vue';
import FormElementProperties from '../components/FormElementProperties.vue';
import FormPreviewDialog from '../components/FormPreviewDialog.vue';
import type { FormElement, FormElementTemplate } from '../types/form';

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
  generateFormHTML
} = useFormBuilder();

const showPreview = ref(false);
const showExportDialog = ref(false);
const exportContent = ref('');

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
});

const createForm = () => {
  createNewForm();
  showSnackbar('New form created', 'success');
};

const handleAddElement = (template: FormElementTemplate, position?: number) => {
  addElement(template, position);
  showSnackbar(`${template.label} added to form`, 'success');
};

const handleMoveElement = (elementId: string, newPosition: number) => {
  moveElement(elementId, newPosition);
  showSnackbar('Element moved', 'info');
};

const handleSelectElement = (element: FormElement) => {
  selectedElement.value = element;
};

const handleDuplicateElement = (elementId: string) => {
  duplicateElement(elementId);
  showSnackbar('Element duplicated', 'success');
};

const handleDeleteElement = (elementId: string) => {
  removeElement(elementId);
  selectedElement.value = null;
  showSnackbar('Element deleted', 'success');
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
};

const handleUpdateDescription = (description: string) => {
  updateFormConfig({ description });
};

const exportForm = () => {
  exportContent.value = generateFormHTML();
  showExportDialog.value = true;
};

const exportConfig = () => {
  exportContent.value = exportFormConfig() || '';
  showExportDialog.value = true;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportContent.value);
    showSnackbar('Copied to clipboard', 'success');
  } catch (error) {
    showSnackbar('Failed to copy to clipboard', 'error');
  }
};

const showSnackbar = (text: string, color: string) => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};
</script>

<style scoped>
.code-textarea :deep(.v-field__input) {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
</style>