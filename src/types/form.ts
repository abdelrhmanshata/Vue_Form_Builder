export interface FormElement {
  id: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  position: number;
  width: 'full' | 'half' | 'third' | 'quarter' | 'two-thirds';
  newRow?: boolean; // Force element to start on a new row
}

export interface FormConfig {
  id: string;
  title: string;
  description: string;
  elements: FormElement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FormElementTemplate {
  type: FormElement['type'];
  label: string;
  icon: string;
  defaultProps: Partial<FormElement>;
}