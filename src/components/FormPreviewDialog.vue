<template>
  <v-dialog v-model="dialog" max-width="800px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-eye" class="mr-2" />
          Form Preview
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="dialog = false"
        />
      </v-card-title>
      
      <v-card-text class="pa-6">
        <div v-if="form" class="form-preview">
          <h2 class="text-h4 mb-2">{{ form.title }}</h2>
          <p class="text-body-1 mb-6 text-grey-darken-1">{{ form.description }}</p>
          
          <v-form ref="previewForm" v-model="isValid">
            <div class="form-preview-container">
              <template v-for="(row, rowIndex) in previewElementRows" :key="`preview-row-${rowIndex}`">
                <div class="form-preview-row">
                  <div
                    v-for="element in row"
                    :key="element.id"
                    class="form-group"
                    :class="`width-${element.width}`"
                  >
                <!-- Text Inputs -->
                <v-text-field
                  v-if="['text', 'email', 'password', 'number'].includes(element.type)"
                  v-model="formData[element.id]"
                  :type="element.type"
                  :label="element.label"
                  :placeholder="element.placeholder"
                  :required="element.required"
                  :rules="getValidationRules(element)"
                  variant="outlined"
                />

                <!-- Date Input -->
                <v-text-field
                  v-else-if="element.type === 'date'"
                  v-model="formData[element.id]"
                  type="date"
                  :label="element.label"
                  :required="element.required"
                  :rules="element.required ? [v => !!v || 'This field is required'] : []"
                  variant="outlined"
                />

                <!-- Textarea -->
                <v-textarea
                  v-else-if="element.type === 'textarea'"
                  v-model="formData[element.id]"
                  :label="element.label"
                  :placeholder="element.placeholder"
                  :required="element.required"
                  :rules="getValidationRules(element)"
                  variant="outlined"
                  rows="3"
                />

                <!-- Select -->
                <v-select
                  v-else-if="element.type === 'select'"
                  v-model="formData[element.id]"
                  :label="element.label"
                  :items="element.options || []"
                  :required="element.required"
                  :rules="element.required ? [v => !!v || 'This field is required'] : []"
                  variant="outlined"
                />

                <!-- Radio Buttons -->
                <div v-else-if="element.type === 'radio'">
                  <v-label class="mb-2">
                    {{ element.label }}
                    <span v-if="element.required" class="text-error">*</span>
                  </v-label>
                  <v-radio-group
                    v-model="formData[element.id]"
                    :rules="element.required ? [v => !!v || 'This field is required'] : []"
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
                  <v-label class="mb-2">{{ element.label }}</v-label>
                  <div class="checkbox-group">
                    <v-checkbox
                      v-for="option in element.options || []"
                      :key="option"
                      v-model="formData[`${element.id}_${option}`]"
                      :label="option"
                      :value="true"
                    />
                  </div>
                </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="form-actions mt-6">
              <v-btn
                color="primary"
                size="large"
                :disabled="!isValid"
                @click="submitForm"
              >
                Submit Form
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="ml-3"
                @click="resetForm"
              >
                Reset
              </v-btn>
            </div>
          </v-form>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import type { FormConfig, FormElement } from '../types/form';

interface Props {
  modelValue: boolean;
  form: FormConfig | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isValid = ref(false);
const previewForm = ref();
const formData = reactive<Record<string, any>>({});

const sortedElements = computed(() => {
  if (!props.form) return [];
  return [...props.form.elements].sort((a, b) => a.position - b.position);
});

// Group elements into rows for preview (same logic as FormCanvas)
const previewElementRows = computed(() => {
  const rows: FormElement[][] = [];
  let currentRow: FormElement[] = [];
  let currentRowWidth = 0;
  
  const getElementWidth = (width: string) => {
    const widthMap = {
      'full': 12,
      'two-thirds': 8,
      'half': 6,
      'third': 4,
      'quarter': 3
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
    rules.push(v => !!v || 'This field is required');
  }
  
  if (element.validation?.minLength) {
    rules.push(v => !v || v.length >= element.validation!.minLength! || `Minimum ${element.validation!.minLength} characters required`);
  }
  
  if (element.validation?.maxLength) {
    rules.push(v => !v || v.length <= element.validation!.maxLength! || `Maximum ${element.validation!.maxLength} characters allowed`);
  }
  
  if (element.validation?.pattern) {
    const regex = new RegExp(element.validation.pattern);
    rules.push(v => !v || regex.test(v) || 'Invalid format');
  }
  
  return rules;
};

const submitForm = () => {
  console.log('Form submitted with data:', formData);
  // Here you would typically send the data to a server
  alert('Form submitted successfully! Check console for data.');
};

const resetForm = () => {
  Object.keys(formData).forEach(key => {
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
.form-preview {
  max-width: 600px;
  margin: 0 auto;
}

.form-preview-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #E0E0E0;
}
</style>