import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Field, Input, Select } from '@/ui';

export interface UserFormValues {
  id: number | '';
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
}

interface UserFormProps {
  onSubmit: (userData: UserFormValues) => void;
  initialData?: Partial<UserFormValues> | null;
  onCancel?: () => void;
  submitting?: boolean;
}

/** The roles the backend's `CustomUser.user_type` accepts. */
const USER_TYPES = [
  { value: 'admin', label: 'Admin' },
  { value: 'customer', label: 'Customer' },
  { value: 'research', label: 'Research' },
  { value: 'coach', label: 'Coach' },
  { value: 'client', label: 'Client' },
];

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  user_type: Yup.string().required('Required'),
  is_active: Yup.boolean().required('Required'),
});

const toValues = (initialData?: Partial<UserFormValues> | null): UserFormValues => ({
  id: initialData?.id ?? '',
  email: initialData?.email ?? '',
  first_name: initialData?.first_name ?? '',
  last_name: initialData?.last_name ?? '',
  user_type: initialData?.user_type ?? 'customer',
  is_active: initialData?.is_active ?? true,
});

/** Only surface a validation message once the user has touched the field. */
const errorFor = (
  formik: ReturnType<typeof useFormik<UserFormValues>>,
  key: keyof UserFormValues
): string | null => {
  const message = formik.errors[key];
  return formik.touched[key] && typeof message === 'string' ? message : null;
};

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialData, onCancel, submitting }) => {
  const formik = useFormik<UserFormValues>({
    initialValues: toValues(initialData),
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      // Only a create form clears itself; an edit keeps showing what was saved.
      if (!initialData) formik.resetForm();
    },
  });

  const { setValues } = formik;

  useEffect(() => {
    if (initialData) setValues(toValues(initialData));
  }, [initialData, setValues]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
      <Field label="Email" required error={errorFor(formik, 'email')}>
        <Input
          type="email"
          name="email"
          autoComplete="off"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" required error={errorFor(formik, 'first_name')}>
          <Input
            type="text"
            name="first_name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Field>

        <Field label="Last name" required error={errorFor(formik, 'last_name')}>
          <Input
            type="text"
            name="last_name"
            value={formik.values.last_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="User type" required error={errorFor(formik, 'user_type')}>
          <Select
            name="user_type"
            value={formik.values.user_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            {USER_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Active"
          error={errorFor(formik, 'is_active')}
          hint="Inactive accounts cannot sign in."
        >
          <Select
            name="is_active"
            value={formik.values.is_active.toString()}
            onChange={(event) => formik.setFieldValue('is_active', event.target.value === 'true')}
            onBlur={formik.handleBlur}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {initialData ? 'Update user' : 'Create user'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
