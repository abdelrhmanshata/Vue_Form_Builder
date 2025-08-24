<template>
  <v-card class="form-element-properties" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-cog" class="mr-2" />
      Element Properties
    </v-card-title>
    
    <v-card-text>
      <div v-if="element" class="properties-form">
        <v-form>
          <!-- Basic Properties -->
          <v-text-field
            :model-value="element.label"
            label="Label"
            variant="outlined"
            density="compact"
            class="mb-3"
            @update:model-value="updateProperty('label', $event)"
          />
          
          <v-text-field
            v-if="hasPlaceholder"
            :model-value="element.placeholder || ''"
            label="Placeholder"
            variant="outlined"
            density="compact"
            class="mb-3"
            @update:model-value="updateProperty('placeholder', $event)"
          />
          
          <!-- Width Control -->
          <v-select
            :model-value="element.width"
            :items="widthOptions"
            label="Width"
            variant="outlined"
            density="compact"
            class="mb-3"
            @update:model-value="updateProperty('width', $event)"
          />
          
          <!-- Start New Row Toggle -->
          <v-switch
            :model-value="element.newRow || false"
            label="Start New Row"
            color="primary"
            density="compact"
            class="mb-3"
            @update:model-value="updateProperty('newRow', $event)"
          />
          
          <!-- Required Toggle -->
          <v-switch
            :model-value="element.required"
            label="Required Field"
            color="primary"
            density="compact"
            class="mb-3"
            @update:model-value="updateProperty('required', $event)"
          />
          
          <!-- Options for select, radio, checkbox -->
          <div v-if="hasOptions" class="mb-3">
            <v-label class="mb-2">Options</v-label>
            <div v-for="(option, index) in (element.options || [])" :key="index" class="d-flex align-center mb-2">
              <v-text-field
                :model-value="option"
                variant="outlined"
                density="compact"
                class="flex-grow-1 mr-2"
                @update:model-value="updateOption(index, $event)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="removeOption(index)"
              />
            </div>
            <v-btn
              prepend-icon="mdi-plus"
              variant="outlined"
              size="small"
              @click="addOption"
            >
              Add Option
            </v-btn>
          </div>
          
          <!-- Validation Properties -->
          <v-expansion-panels v-if="hasValidation" variant="accordion" class="mb-3">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon icon="mdi-shield-check" class="mr-2" />
                Validation Rules
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-text-field
                  v-if="element.type === 'text' || element.type === 'textarea'"
                  :model-value="element.validation?.minLength || ''"
                  label="Minimum Length"
                  type="number"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  @update:model-value="updateValidation('minLength', parseInt($event) || undefined)"
                />
                
                <v-text-field
                  v-if="element.type === 'text' || element.type === 'textarea'"
                  :model-value="element.validation?.maxLength || ''"
                  label="Maximum Length"
                  type="number"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  @update:model-value="updateValidation('maxLength', parseInt($event) || undefined)"
                />
                
                <v-text-field
                  v-if="element.type === 'text' || element.type === 'email'"
                  :model-value="element.validation?.pattern || ''"
                  label="Pattern (Regex)"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  @update:model-value="updateValidation('pattern', $event || undefined)"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-form>
        
        <!-- Action Buttons -->
        <div class="d-flex justify-space-between mt-4">
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete"
            @click="$emit('delete-element')"
          >
            Delete
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-content-duplicate"
            @click="$emit('duplicate-element')"
          >
            Duplicate
          </v-btn>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state text-center py-8">
        <v-icon icon="mdi-cursor-pointer" size="64" color="grey-lighten-2" class="mb-4" />
        <h3 class="text-h6 mb-2 text-grey-darken-1">No Element Selected</h3>
        <p class="text-body-2 text-grey-darken-1">
          Click on a form element to edit its properties
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FormElement } from '../types/form';

interface Props {
  element: FormElement | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update-element': [elementId: string, updates: Partial<FormElement>];
  'delete-element': [];
  'duplicate-element': [];
}>();

const widthOptions = [
  { title: 'Full Width (100%)', value: 'full' },
  { title: 'Two Thirds (66%)', value: 'two-thirds' },
  { title: 'Half Width (50%)', value: 'half' },
  { title: 'One Third (33%)', value: 'third' },
  { title: 'Quarter Width (25%)', value: 'quarter' }
];

const hasPlaceholder = computed(() => {
  if (!props.element) return false;
  return ['text', 'email', 'password', 'number', 'textarea'].includes(props.element.type);
});

const hasOptions = computed(() => {
  if (!props.element) return false;
  return ['select', 'radio', 'checkbox'].includes(props.element.type);
});

const hasValidation = computed(() => {
  if (!props.element) return false;
  return ['text', 'email', 'textarea', 'number'].includes(props.element.type);
});

const updateProperty = (key: keyof FormElement, value: any) => {
  if (!props.element) return;
  emit('update-element', props.element.id, { [key]: value });
};

const updateValidation = (key: string, value: any) => {
  if (!props.element) return;
  const validation = { ...props.element.validation, [key]: value };
  emit('update-element', props.element.id, { validation });
};

const updateOption = (index: number, value: string) => {
  if (!props.element?.options) return;
  const newOptions = [...props.element.options];
  newOptions[index] = value;
  emit('update-element', props.element.id, { options: newOptions });
};

const addOption = () => {
  if (!props.element) return;
  const currentOptions = props.element.options || [];
  const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
  emit('update-element', props.element.id, { options: newOptions });
};

const removeOption = (index: number) => {
  if (!props.element?.options) return;
  const newOptions = props.element.options.filter((_, i) => i !== index);
  emit('update-element', props.element.id, { options: newOptions });
};
</script>

<style scoped>
.form-element-properties {
  height: fit-content;
  position: sticky;
  top: 20px;
}

.properties-form {
  max-width: 100%;
}

.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}
</style>