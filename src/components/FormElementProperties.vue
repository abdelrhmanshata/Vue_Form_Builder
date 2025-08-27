<template>
  <v-card class="form-element-properties" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-cog" class="mr-2" />
      Element Properties
      <v-chip v-if="element" color="primary" size="small" class="ml-2">
        {{ elementTypeLabel }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <div v-if="element" class="properties-form">
        <!-- Basic Properties Section -->
        <v-expansion-panels variant="accordion" class="mb-3" v-model="expandedPanels">
          <v-expansion-panel value="basic">
            <v-expansion-panel-title>
              <v-icon icon="mdi-tune" class="mr-2" />
              Basic Properties
            </v-expansion-panel-title>
            <v-expansion-panel-text>
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
                :model-value="element.placeholder"
                label="Placeholder"
                variant="outlined"
                density="compact"
                class="mb-3"
                @update:model-value="updateProperty('placeholder', $event)"
              />

              <v-select
                :model-value="element.width"
                :items="widthOptions"
                label="Width"
                variant="outlined"
                density="compact"
                class="mb-3"
                @update:model-value="updateProperty('width', $event)"
              />

              <div class="d-flex gap-3">
                <v-switch
                  :model-value="element.newRow"
                  label="Start New Row"
                  color="primary"
                  density="compact"
                  @update:model-value="updateProperty('newRow', $event)"
                />

                <v-switch
                  :model-value="element.required"
                  label="Required Field"
                  color="primary"
                  density="compact"
                  @update:model-value="updateProperty('required', $event)"
                />
              </div>

              <!-- Multiple Selection for select elements -->
              <v-switch
                v-if="
                  element.type === 'select' ||
                  element.type === 'multiselect' ||
                  element.type === 'auto_select'
                "
                :model-value="element.multiple"
                label="Multiple Selection"
                color="primary"
                density="compact"
                class="mb-3"
                @update:model-value="updateProperty('multiple', $event)"
              />

              <!-- Multiple Selection for select elements -->
              <v-switch
                v-if="element.type === 'radio' || element.type === 'checkbox'"
                :model-value="element.inline"
                label="Inline Selection"
                color="primary"
                density="compact"
                class="mb-3"
                @update:model-value="updateProperty('inline', $event)"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Options Section -->
          <v-expansion-panel value="options" v-if="hasOptions">
            <v-expansion-panel-title>
              <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
              Options
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="options-list">
                <div
                  v-for="(option, index) in element.options || []"
                  :key="index"
                  class="option-item d-flex align-center mb-2"
                >
                  <v-text-field
                    :model-value="option"
                    :label="`Option ${index + 1}`"
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
                    :disabled="element.options && element.options.length <= 1"
                  />
                </div>
              </div>
              <v-btn
                prepend-icon="mdi-plus"
                variant="outlined"
                size="small"
                @click="addOption"
                class="mt-2"
              >
                Add Option
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Type-Specific Properties -->
          <v-expansion-panel value="typeSpecific" v-if="hasTypeSpecificProperties">
            <v-expansion-panel-title>
              <v-icon :icon="typeSpecificIcon" class="mr-2" />
              {{ typeSpecificTitle }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <!-- Image Properties -->
              <div v-if="element.type === 'image'">
                <v-text-field
                  :model-value="element.src"
                  label="Image URL"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  @update:model-value="updateProperty('src', $event)"
                  placeholder="https://example.com/image.jpg"
                />
                <v-text-field
                  :model-value="element.alt"
                  label="Alt Text"
                  variant="outlined"
                  density="compact"
                  @update:model-value="updateProperty('alt', $event)"
                  placeholder="Description of the image"
                />
              </div>

              <!-- Date Properties -->
              <div v-if="element.type === 'date'">
                <v-text-field
                  :model-value="element.minDate"
                  label="Min Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                  @update:model-value="updateProperty('minDate', $event)"
                />
                <v-text-field
                  :model-value="element.maxDate"
                  label="Max Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                  @update:model-value="updateProperty('maxDate', $event)"
                />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Validation Section -->
          <v-expansion-panel value="validation" v-if="hasValidation">
            <v-expansion-panel-title>
              <v-icon icon="mdi-shield-check" class="mr-2" />
              Validation Rules
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="validation-rules">
                <!-- Text validation -->
                <template v-if="['text', 'textarea'].includes(element.type)">
                  <v-text-field
                    :model-value="element.validation?.minLength || ''"
                    label="Minimum Length"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                    @update:model-value="
                      updateValidation('minLength', $event ? parseInt($event) : undefined)
                    "
                    min="0"
                  />

                  <v-text-field
                    :model-value="element.validation?.maxLength || ''"
                    label="Maximum Length"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                    @update:model-value="
                      updateValidation('maxLength', $event ? parseInt($event) : undefined)
                    "
                    min="1"
                  />

                  <v-text-field
                    :model-value="element.validation?.pattern || ''"
                    label="Pattern (Regex)"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                    @update:model-value="updateValidation('pattern', $event || undefined)"
                    placeholder="^[a-zA-Z0-9]+$"
                  />
                </template>

                <!-- Number validation -->
                <template v-if="element.type === 'number'">
                  <v-text-field
                    :model-value="element.validation?.min || ''"
                    label="Minimum Value"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                    @update:model-value="
                      updateValidation('min', $event ? parseFloat($event) : undefined)
                    "
                  />

                  <v-text-field
                    :model-value="element.validation?.max || ''"
                    label="Maximum Value"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                    @update:model-value="
                      updateValidation('max', $event ? parseFloat($event) : undefined)
                    "
                  />
                </template>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Dependencies Section -->
          <v-expansion-panel value="dependencies">
            <v-expansion-panel-title>
              <v-icon icon="mdi-link" class="mr-2" />
              Dependencies
              <v-chip
                v-if="element.dependencies?.length"
                size="x-small"
                color="primary"
                class="ml-2"
              >
                {{ element.dependencies.length }}
              </v-chip>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div
                v-if="element.dependencies && element.dependencies.length > 0"
                class="dependencies-list"
              >
                <div
                  v-for="(dependency, index) in element.dependencies"
                  :key="index"
                  class="dependency-item mb-4 pa-3 rounded border"
                >
                  <div class="d-flex justify-space-between align-start mb-2">
                    <h4 class="text-caption font-weight-medium">
                      Dependency {{ index + 1 }}
                    </h4>
                    <v-btn
                      icon="mdi-delete"
                      size="x-small"
                      color="error"
                      variant="text"
                      @click="removeDependency(index)"
                    />
                  </div>

                  <v-select
                    :model-value="dependency.elementId"
                    :items="availableDependencies"
                    label="Depends On"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'elementId', $event)"
                    :hint="getElementTypeHint(dependency.elementId)"
                    persistent-hint
                  />

                  <v-select
                    :model-value="dependency.condition"
                    :items="conditionOptions"
                    label="Condition"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'condition', $event)"
                  />

                  <v-text-field
                    :model-value="dependency.value"
                    label="Value"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'value', $event)"
                    :hint="getValueHint(dependency.condition)"
                    persistent-hint
                  />

                  <v-select
                    :model-value="dependency.action"
                    :items="actionOptions"
                    label="Action"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateDependency(index, 'action', $event)"
                  />
                </div>
              </div>

              <v-btn
                prepend-icon="mdi-plus"
                variant="outlined"
                size="small"
                @click="addDependency"
                :disabled="availableDependencies.length === 0"
                class="mt-2"
              >
                Add Dependency
                <template v-slot:append>
                  <v-tooltip v-if="availableDependencies.length === 0" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-information" size="small" />
                    </template>
                    <span>No other elements available for dependency</span>
                  </v-tooltip>
                </template>
              </v-btn>

              <div
                v-if="availableDependencies.length === 0"
                class="text-caption text-grey mt-2"
              >
                Add more elements to create dependencies.
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Quick Actions -->
        <div class="quick-actions mt-4">
          <v-alert v-if="hasChanges" type="info" density="compact" class="mb-3">
            Changes are applied automatically
          </v-alert>

          <div class="d-flex justify-space-between">
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              @click="$emit('delete-element')"
              size="small"
            >
              Delete
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-content-duplicate"
              @click="$emit('duplicate-element')"
              size="small"
            >
              Duplicate
            </v-btn>
          </div>
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
import { computed, ref, watch } from "vue";
import type { FormElement, FormElementDependency } from "../types/form";

interface Props {
  element: FormElement | null;
  availableElements?: FormElement[];
}

const props = withDefaults(defineProps<Props>(), {
  availableElements: () => [],
});

const emit = defineEmits<{
  "update-element": [elementId: string, updates: Partial<FormElement>];
  "delete-element": [];
  "duplicate-element": [];
}>();

const expandedPanels = ref(["basic"]);
const hasChanges = ref(false);

// Reset changes flag when element changes
watch(
  () => props.element,
  () => {
    hasChanges.value = false;
    expandedPanels.value = ["basic"];
  }
);

const elementTypeLabel = computed(() => {
  if (!props.element) return "";
  const typeMap: Record<string, string> = {
    text: "Text Input",
    number: "Number Input",
    textarea: "Text Area",
    date: "Date Picker",
    select: "Select Dropdown",
    multiselect: "Multi Select",
    radio: "Radio Buttons",
    checkbox: "Checkboxes",
    image: "Image Upload",
    file: "File Upload",
  };
  return typeMap[props.element.type] || props.element.type;
});

const widthOptions = [
  { title: "Full Width (100%)", value: "full" },
  { title: "Two Thirds (66%)", value: "two-thirds" },
  { title: "Half Width (50%)", value: "half" },
  { title: "One Third (33%)", value: "third" },
  { title: "Quarter Width (25%)", value: "quarter" },
];

const conditionOptions = [
  { title: "Equals", value: "equals" },
  { title: "Not Equals", value: "notEquals" },
  { title: "Contains", value: "contains" },
  { title: "Greater Than", value: "greaterThan" },
  { title: "Less Than", value: "lessThan" },
];

const actionOptions = [
  { title: "Show Element", value: "show" },
  { title: "Hide Element", value: "hide" },
  { title: "Enable Element", value: "enable" },
  { title: "Disable Element", value: "disable" },
  { title: "Update Options", value: "updateOptions" },
];

const hasPlaceholder = computed(() => {
  if (!props.element) return false;
  return ["text", "email", "number", "textarea"].includes(props.element.type);
});

const hasOptions = computed(() => {
  if (!props.element) return false;
  return ["select", "multiselect", "radio", "checkbox"].includes(props.element.type);
});

const hasValidation = computed(() => {
  if (!props.element) return false;
  return ["text", "email", "textarea", "number"].includes(props.element.type);
});

const hasTypeSpecificProperties = computed(() => {
  if (!props.element) return false;
  return ["image", "date"].includes(props.element.type);
});

const typeSpecificIcon = computed(() => {
  if (!props.element) return "mdi-cog";
  return props.element.type === "image" ? "mdi-image" : "mdi-calendar";
});

const typeSpecificTitle = computed(() => {
  if (!props.element) return "";
  return props.element.type === "image" ? "Image Properties" : "Date Range";
});

const availableDependencies = computed(() => {
  return props.availableElements
    .filter((el) => el.id !== props.element?.id)
    .map((el) => ({
      title: `${el.label} (${el.type})`,
      value: el.id,
    }));
});

const updateProperty = (key: keyof FormElement, value: any) => {
  if (!props.element) return;
  hasChanges.value = true;
  emit("update-element", props.element.id, { [key]: value });
};

const updateValidation = (key: string, value: any) => {
  if (!props.element) return;
  hasChanges.value = true;
  const validation = { ...props.element.validation, [key]: value };
  // Remove undefined values
  Object.keys(validation).forEach((k) => {
    if (validation[k as keyof typeof validation] === undefined) {
      delete validation[k as keyof typeof validation];
    }
  });
  emit("update-element", props.element.id, { validation });
};

const updateOption = (index: number, value: string) => {
  if (!props.element?.options) return;
  hasChanges.value = true;
  const newOptions = [...props.element.options];
  newOptions[index] = value;
  emit("update-element", props.element.id, { options: newOptions });
};

const addOption = () => {
  if (!props.element) return;
  hasChanges.value = true;
  const currentOptions = props.element.options || [];
  const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
  emit("update-element", props.element.id, { options: newOptions });
};

const removeOption = (index: number) => {
  if (!props.element?.options) return;
  hasChanges.value = true;
  const newOptions = props.element.options.filter((_, i) => i !== index);
  emit("update-element", props.element.id, { options: newOptions });
};

const addDependency = () => {
  if (!props.element || availableDependencies.value.length === 0) return;
  hasChanges.value = true;
  const newDependency: FormElementDependency = {
    elementId: availableDependencies.value[0]?.value || "",
    condition: "equals",
    value: "",
    action: "show",
  };
  const currentDependencies = props.element.dependencies || [];
  const newDependencies = [...currentDependencies, newDependency];
  emit("update-element", props.element.id, { dependencies: newDependencies });
};

const updateDependency = (
  index: number,
  key: keyof FormElementDependency,
  value: any
) => {
  if (!props.element?.dependencies) return;
  hasChanges.value = true;
  const newDependencies = [...props.element.dependencies];
  newDependencies[index] = { ...newDependencies[index], [key]: value };
  emit("update-element", props.element.id, { dependencies: newDependencies });
};

const removeDependency = (index: number) => {
  if (!props.element?.dependencies) return;
  hasChanges.value = true;
  const newDependencies = props.element.dependencies.filter((_, i) => i !== index);
  emit("update-element", props.element.id, { dependencies: newDependencies });
};

const getElementTypeHint = (elementId: string) => {
  const element = props.availableElements.find((el) => el.id === elementId);
  return element ? `Type: ${element.type}` : "";
};

const getValueHint = (condition: string) => {
  const hints: Record<string, string> = {
    equals: "Value must exactly match",
    notEquals: "Value must not match",
    contains: "Value must contain this text",
    greaterThan: "Value must be greater than this number",
    lessThan: "Value must be less than this number",
  };
  return hints[condition] || "Enter comparison value";
};
</script>

<style scoped>
.form-element-properties {
  height: fit-content;
  position: sticky;
  top: 20px;
  max-height: 100vh;
  overflow-y: auto;
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

.dependencies-list {
  max-height: 300px;
  overflow-y: auto;
}

.dependency-item {
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
}

.option-item {
  transition: all 0.2s ease;
}

.option-item:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
}

.quick-actions {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}

.gap-3 {
  gap: 12px;
}
</style>
