<template>
  <v-dialog v-model="dialog" max-width="800px" scrollable persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between bg-primary">
        <div class="d-flex align-center text-white">
          <v-icon icon="mdi-eye" class="mr-2" />
          Form Preview
          <v-chip size="small" class="ml-2" color="white" text-color="primary">
            {{ form?.elements.length }} elements
          </v-chip>
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" @click="dialog = false" />
      </v-card-title>

      <v-card-text class="pa-6">
        <div v-if="form" class="form-preview">
          <!-- Form Header -->
          <div class="preview-header text-center mb-6">
            <h2 class="text-h4 mb-2 primary--text">{{ form.title }}</h2>
            <p v-if="form.description" class="text-body-1 mb-6 text-grey-darken-1">
              {{ form.description }}
            </p>
            <v-divider class="my-4" />
          </div>

          <v-form ref="previewForm" v-model="isValid" class="preview-form">
            <div class="form-preview-container">
              <template
                v-for="(row, rowIndex) in previewElementRows"
                :key="`preview-row-${rowIndex}`"
              >
                <div class="form-preview-row">
                  <div
                    v-for="element in row"
                    :key="element.id"
                    class="form-group"
                    :class="`width-${element.width}`"
                  >
                    <!-- Text Inputs -->
                    <BaseTextField
                      v-if="['text', 'email', 'number', 'date'].includes(element.type)"
                      v-model="formData[element.id]"
                      :element="element"
                      :rules="getValidationRules(element)"
                    />

                    <!-- Textarea -->
                    <BaseTextArea
                      v-else-if="element.type === 'textarea'"
                      v-model="formData[element.id]"
                      :element="element"
                      :rules="getValidationRules(element)"
                    />

                    <!-- Date Picker -->
                    <BaseDatePicker
                      v-else-if="element.type === 'date_picker'"
                      v-model="formData[element.id]"
                      :element="element"
                      :rules="
                        element.required ? [(v) => !!v || 'This field is required'] : []
                      "
                    />

                    <!-- Select -->
                    <v-select
                      v-else-if="element.type === 'select'"
                      v-model="formData[element.id]"
                      :label="element.label"
                      :items="element.options || []"
                      :required="element.required"
                      :rules="
                        element.required ? [(v) => !!v || 'This field is required'] : []
                      "
                      variant="outlined"
                      density="comfortable"
                      clearable
                    />

                    <!-- Multi Select -->
                    <v-select
                      v-else-if="element.type === 'multiselect'"
                      v-model="formData[element.id]"
                      :label="element.label"
                      :items="element.options || []"
                      :required="element.required"
                      :rules="
                        element.required ? [(v) => !!v || 'This field is required'] : []
                      "
                      variant="outlined"
                      density="comfortable"
                      multiple
                      chips
                    />

                    <!-- Radio Buttons -->
                    <div v-else-if="element.type === 'radio'">
                      <v-label class="mb-2">
                        {{ element.label }}
                        <span v-if="element.required" class="text-error">*</span>
                      </v-label>
                      <v-radio-group
                        v-model="formData[element.id]"
                        :rules="
                          element.required ? [(v) => !!v || 'This field is required'] : []
                        "
                        density="comfortable"
                      >
                        <v-radio
                          v-for="option in element.options || []"
                          :key="option"
                          :label="option"
                          :value="option"
                        />
                      </v-radio-group>
                    </div>

                    <!-- Checkboxes -->
                    <div v-else-if="element.type === 'checkbox'">
                      <v-label class="mb-2">
                        {{ element.label }}
                        <span v-if="element.required" class="text-error">*</span>
                      </v-label>
                      <div class="checkbox-group">
                        <v-checkbox
                          v-for="option in element.options || []"
                          :key="option"
                          v-model="formData[`${element.id}_${option}`]"
                          :label="option"
                          :value="true"
                          density="comfortable"
                        />
                      </div>
                    </div>

                    <!-- Image Upload -->
                    <div v-else-if="element.type === 'image'">
                      <v-label class="mb-2">
                        {{ element.label }}
                        <span v-if="element.required" class="text-error">*</span>
                      </v-label>
                      <v-file-input
                        v-model="formData[element.id]"
                        :required="element.required"
                        :rules="
                          element.required ? [(v) => !!v || 'This field is required'] : []
                        "
                        accept="image/*"
                        prepend-icon="mdi-image"
                        variant="outlined"
                        density="comfortable"
                        :show-size="1000"
                      />
                    </div>

                    <!-- File Upload -->
                    <div v-else-if="element.type === 'file'">
                      <v-label class="mb-2">
                        {{ element.label }}
                        <span v-if="element.required" class="text-error">*</span>
                      </v-label>
                      <v-file-input
                        v-model="formData[element.id]"
                        :required="element.required"
                        :rules="
                          element.required ? [(v) => !!v || 'This field is required'] : []
                        "
                        prepend-icon="mdi-file"
                        variant="outlined"
                        density="comfortable"
                        :show-size="1000"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <v-divider class="my-6" />

            <div class="form-actions">
              <v-btn
                color="primary"
                size="large"
                :disabled="!isValid"
                @click="submitForm"
                prepend-icon="mdi-send"
                :loading="isSubmitting"
              >
                Submit Form
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="ml-3"
                @click="resetForm"
                prepend-icon="mdi-refresh"
              >
                Reset
              </v-btn>
            </div>
          </v-form>
        </div>

        <div v-else class="text-center py-8">
          <v-icon icon="mdi-alert" size="64" color="grey-lighten-2" class="mb-4" />
          <h3 class="text-h6 mb-2 text-grey-darken-1">No form to preview</h3>
          <p class="text-body-2 text-grey-darken-1">Please create a form first</p>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer />
        <v-btn @click="dialog = false" variant="text">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
import type { FormConfig, FormElement } from "../types/form";
import BaseTextField from "./Elements/BaseTextField.vue";
import BaseTextArea from "./Elements/BaseTextArea.vue";
import BaseDatePicker from "./Elements/BaseDatePicker.vue";

interface Props {
  modelValue: boolean;
  form: FormConfig | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const isValid = ref(false);
const isSubmitting = ref(false);
const previewForm = ref();
const formData = reactive<Record<string, any>>({});

const sortedElements = computed(() => {
  if (!props.form) return [];
  return [...props.form.elements].sort((a, b) => a.position - b.position);
});

// Group elements into rows for preview
const previewElementRows = computed(() => {
  const rows: FormElement[][] = [];
  let currentRow: FormElement[] = [];
  let currentRowWidth = 0;

  const getElementWidth = (width: string) => {
    const widthMap = {
      full: 12,
      "two-thirds": 8,
      half: 6,
      third: 4,
      quarter: 3,
    };
    return widthMap[width as keyof typeof widthMap] || 12;
  };

  sortedElements.value.forEach((element) => {
    const elementWidth = getElementWidth(element.width);

    if (element.newRow || currentRowWidth + elementWidth > 12) {
      if (currentRow.length > 0) {
        rows.push([...currentRow]);
        currentRow = [];
        currentRowWidth = 0;
      }
    }

    currentRow.push(element);
    currentRowWidth += elementWidth;

    if (currentRowWidth >= 12) {
      rows.push([...currentRow]);
      currentRow = [];
      currentRowWidth = 0;
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
});

const getValidationRules = (element: FormElement) => {
  const rules: Array<(v: any) => boolean | string> = [];

  if (element.required) {
    rules.push((v) => !!v || "This field is required");
  }

  if (element.validation?.minLength) {
    rules.push(
      (v) =>
        !v ||
        v.length >= element.validation!.minLength! ||
        `Minimum ${element.validation!.minLength} characters required`
    );
  }

  if (element.validation?.maxLength) {
    rules.push(
      (v) =>
        !v ||
        v.length <= element.validation!.maxLength! ||
        `Maximum ${element.validation!.maxLength} characters allowed`
    );
  }

  if (element.validation?.pattern) {
    const regex = new RegExp(element.validation.pattern);
    rules.push((v) => !v || regex.test(v) || "Invalid format");
  }

  if (element.validation?.min) {
    rules.push(
      (v) =>
        !v ||
        v >= element.validation!.min! ||
        `Minimum value is ${element.validation!.min}`
    );
  }

  if (element.validation?.max) {
    rules.push(
      (v) =>
        !v ||
        v <= element.validation!.max! ||
        `Maximum value is ${element.validation!.max}`
    );
  }

  return rules;
};

const submitForm = async () => {
  isSubmitting.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted with data:", formData);

    // Show success message
    alert("Form submitted successfully! Check console for data.");

    // Reset form after successful submission
    // resetForm();
  } catch (error) {
    console.error("Form submission error:", error);
    alert("Failed to submit form. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    delete formData[key];
  });
  previewForm.value?.reset();
};

// Reset form data when dialog opens
watch(dialog, (newValue) => {
  if (newValue) {
    resetForm();
  }
});
</script>

<style scoped>
.preview-header {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
}

.form-preview {
  max-width: 600px;
  margin: 0 auto;
}

.form-preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-preview-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  align-items: start;
}

.form-group.width-full {
  grid-column: span 12;
}

.form-group.width-half {
  grid-column: span 6;
}

.form-group.width-third {
  grid-column: span 4;
}

.form-group.width-quarter {
  grid-column: span 3;
}

.form-group.width-two-thirds {
  grid-column: span 8;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  text-align: center;
  padding-top: 16px;
}

@media (max-width: 768px) {
  .form-preview-row {
    grid-template-columns: 1fr;
  }

  .form-group.width-half,
  .form-group.width-third,
  .form-group.width-quarter,
  .form-group.width-two-thirds {
    grid-column: span 1;
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-actions .v-btn {
    margin: 0;
  }
}
</style>
