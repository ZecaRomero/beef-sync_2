/**
 * Hook genérico para gerenciar formulários com validação
 */
import React, { ChangeEvent, useCallback, useState } from 'react'

;
import type { ValidationError } from '@/types';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => ValidationError[];
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormResult<T> {
  values: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleChangeField: (field: keyof T, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, message: string) => void;
  reset: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar campo individual
  const validateField = useCallback((field: keyof T): boolean => {
    if (!validate) return true;

    const allErrors = validate(values);
    const fieldErrors = allErrors.filter(err => err.field === field);
    
    // Atualizar apenas os erros deste campo
    setErrors(prev => [
      ...prev.filter(err => err.field !== field),
      ...fieldErrors,
    ]);

    return fieldErrors.length === 0;
  }, [values, validate]);

  // Validar formulário inteiro
  const validateForm = useCallback((): boolean => {
    if (!validate) return true;

    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [values, validate]);

  // Verificar se o formulário é válido
  const isValid = errors.length === 0;

  // Manipular mudanças em inputs
  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    
    // Tratar diferentes tipos de input
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }

    setValues(prev => ({
      ...prev,
      [name]: finalValue,
    }));

    // Validar campo após mudança
    if (validate) {
      setTimeout(() => validateField(name as keyof T), 0);
    }
  }, [validate, validateField]);

  // Manipular mudança de campo específico (para componentes customizados)
  const handleChangeField = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validar campo após mudança
    if (validate) {
      setTimeout(() => validateField(field), 0);
    }
  }, [validate, validateField]);

  // Definir valor de campo
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Definir erro de campo
  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => [
      ...prev.filter(err => err.field !== field),
      { field: field as string, message },
    ]);
  }, []);

  // Submeter formulário
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validar antes de submeter
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  // Resetar formulário
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    handleChange,
    handleChangeField,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
    validateField,
    validateForm,
  };
}

