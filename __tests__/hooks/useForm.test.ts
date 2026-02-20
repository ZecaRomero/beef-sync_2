/**
 * Testes para hook useForm
 */
import { renderHook, act } from '@testing-library/react';
import { useForm } from '@/hooks/useForm';
import type { ValidationError } from '@/types';

describe('useForm', () => {
  const initialValues = {
    name: '',
    email: '',
    age: 0,
  };

  it('deve inicializar com valores iniciais', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('deve atualizar valores ao chamar handleChangeField', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChangeField('name', 'John Doe');
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  it('deve validar campos', () => {
    const validate = (values: typeof initialValues): ValidationError[] => {
      const errors: ValidationError[] = [];
      if (!values.name) {
        errors.push({ field: 'name', message: 'Nome é obrigatório' });
      }
      return errors;
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        validate,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.validateForm();
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].field).toBe('name');
    expect(result.current.isValid).toBe(false);
  });

  it('deve chamar onSubmit quando formulário é válido', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({
        initialValues: { ...initialValues, name: 'John' },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ ...initialValues, name: 'John' });
  });

  it('deve resetar formulário', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChangeField('name', 'John');
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
  });
});

