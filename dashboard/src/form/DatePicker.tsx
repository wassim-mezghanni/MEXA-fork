import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A4D2E', // Forest Green
    },
    background: {
      paper: '#FFFFFF', // surface-container-lowest
      default: '#F8F9FA', // surface
    },
    text: {
      primary: '#191C1D', // on-surface
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#EAEFEA', // Approximate surface-container-high
          borderRadius: '8px',
          fontFamily: 'Inter, system-ui, sans-serif',
          '& fieldset': { border: 'none' },
          '&:hover fieldset': { border: 'none' },
          '&.Mui-focused fieldset': { border: 'none' },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 0 2px rgba(26, 77, 46, 0.2)', // focus:ring-primary/20
          }
        },
        input: {
          padding: '16px',
           color: '#191C1D',
        }
      }
    }
  }
});

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(({
  label,
  error,
  helperText,
  className = '',
  value,
  defaultValue,
  onChange,
  name,
}, ref) => {
  // Handle string values (YYYY-MM-DD or similar) -> Date
  const valString = (value !== undefined ? value : defaultValue) as string;
  const parsed = valString ? parseISO(valString) : null;
  const parsedDate = parsed && !isNaN(parsed.getTime()) ? parsed : null;

  const handleChange = (newValue: Date | null) => {
    if (onChange) {
      let dateString = '';
      if (newValue && !isNaN(newValue.getTime())) {
        const year = newValue.getFullYear();
        const month = String(newValue.getMonth() + 1).padStart(2, '0');
        const day = String(newValue.getDate()).padStart(2, '0');
        dateString = `${year}-${month}-${day}`;
      }
      
      const mockEvent = {
        target: { value: dateString, name },
        currentTarget: { value: dateString, name },
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(mockEvent);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={`space-y-2 w-full ${className}`}>
        {label && (
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1 font-heading">
            {label}
          </label>
        )}
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            value={parsedDate}
            onChange={handleChange}
            slotProps={{
              popper: {
                placement: 'bottom-start',
                disablePortal: false,
                modifiers: [
                  {
                    name: 'flip',
                    enabled: true,
                    options: { fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] },
                  },
                  {
                    name: 'preventOverflow',
                    enabled: true,
                    options: { boundary: 'viewport', altAxis: true, padding: 8 },
                  },
                ],
                sx: {
                  zIndex: 1500,
                  '& .MuiPaper-root': {
                    boxShadow: '0 10px 30px -5px rgba(25, 28, 29, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(116, 119, 117, 0.15)',
                  }
                }
              },
              textField: {
                fullWidth: true,
                error: !!error,
                name: name,
                inputRef: ref,
              }
            }}
          />
        </LocalizationProvider>
        
        {error && <p className="text-xs font-bold text-error mt-1 px-1">{error}</p>}
        {!error && helperText && <p className="text-xs text-on-surface-variant/70 mt-1 px-1">{helperText}</p>}
      </div>
    </ThemeProvider>
  );
});

DatePicker.displayName = 'DatePicker';
