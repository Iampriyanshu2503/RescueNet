import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/uiSlice';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const {
    onSuccess,
    onError,
    showSuccessNotification = false,
    showErrorNotification = true,
  } = options;

  const execute = async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showSuccessNotification) {
        dispatch(addNotification({
          type: 'success',
          message: 'Operation completed successfully',
        }));
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      if (showErrorNotification) {
        dispatch(addNotification({
          type: 'error',
          message: errorMessage,
        }));
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
  };
}

export default useApi;
