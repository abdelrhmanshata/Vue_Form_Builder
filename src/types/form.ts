
export interface FormValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FormElementDependency {
  elementId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'updateOptions';
  targetValue?: any; // For updateOptions action
}

export interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  width: 'full' | 'two-thirds' | 'half' | 'third' | 'quarter';
  newRow: boolean;
  position: number;
  options?: string[];
  validation?: FormValidation;
  dependencies?: FormElementDependency[];
  value?: any;
  // Specific properties for different element types
  multiple?: boolean; // For select/multiDropdown
  inline?: boolean; // For radio/checkbox
  maxFiles?: number;// For image
  src?: string; // For image
  alt?: string; // For image
  minDate?: string; // For calendar
  maxDate?: string; // For calendar
}

export interface FormElementTemplate {
  type: string;
  label: string;
  icon: string;
  defaultProps: Partial<FormElement>;
}

export interface FormConfig {
  id: string;
  title: string;
  description: string;
  elements: FormElement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FormHistory {
  actions: FormAction[];
  currentIndex: number;
}

export interface FormAction {
  type: 'add' | 'update' | 'delete' | 'move' | 'config';
  elementId?: string;
  data: any;
  timestamp: Date;
}

export interface FormSettings {
  autoSave: boolean;
  saveInterval: number;
  gridSnap: boolean;
  showGrid: boolean;
  theme: 'light' | 'dark' | 'auto';
}