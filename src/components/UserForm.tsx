// /Users/dev/Documents/bnbu-frontend-app/bnbu_frontend_app/src/components/UserForm.tsx
import React, { useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'

interface UserFormProps {
  onSubmit: (userData: any) => void
  initialData?: any
  onCancel?: () => void 
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const formik = useFormik({
    initialValues: {
      id: initialData?.id || '',
      email: initialData?.email || '',
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      user_type: initialData?.user_type || 'customer',
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      first_name: Yup.string().required('Required'),
      last_name: Yup.string().required('Required'),
      user_type: Yup.string().required('Required'),
      is_active: Yup.boolean().required('Required'),
    }),
    onSubmit: (values) => {
      onSubmit(values)
      if (!initialData) {
        formik.resetForm()
      }
    },
  })

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        id: initialData.id || '',
        email: initialData.email || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        user_type: initialData.user_type || 'customer',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      })
    }
  }, [initialData])

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {formik.touched.email && typeof formik.errors.email === 'string' && (
          <div className="text-red-500 text-sm">{formik.errors.email}</div>
        )}
      </div>
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          name="first_name"
          id="first_name"
          value={formik.values.first_name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {formik.touched.first_name && typeof formik.errors.first_name === 'string' && (
          <div className="text-red-500 text-sm">{formik.errors.first_name}</div>
        )}
      </div>
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          name="last_name"
          id="last_name"
          value={formik.values.last_name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {formik.touched.last_name && typeof formik.errors.last_name === 'string' && (
          <div className="text-red-500 text-sm">{formik.errors.last_name}</div>
        )}
      </div>
      <div>
        <label htmlFor="user_type" className="block text-sm font-medium text-gray-700">
          User Type
        </label>
        <select
          name="user_type"
          id="user_type"
          value={formik.values.user_type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="research">Research</option>
          <option value="coach">Coach</option>
          <option value="client">Client</option>
        </select>
        {formik.touched.user_type && typeof formik.errors.user_type === 'string' && (
          <div className="text-red-500 text-sm">{formik.errors.user_type}</div>
        )}
      </div>
      <div>
        <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
          Active
        </label>
        <select
          name="is_active"
          id="is_active"
          value={formik.values.is_active.toString()}
          onChange={(e) => formik.setFieldValue('is_active', e.target.value === 'true')}
          onBlur={formik.handleBlur}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {formik.touched.is_active && typeof formik.errors.is_active === 'string' && (
          <div className="text-red-500 text-sm">{formik.errors.is_active}</div>
        )}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {initialData ? 'Update User' : 'Create User'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
      )}
    </form>
  )
}

export default UserForm
