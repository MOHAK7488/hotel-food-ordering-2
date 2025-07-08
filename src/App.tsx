Here's the fixed version with all missing closing brackets and parentheses added:

```typescript
// At the end of the handleMobileChange function, add closing brace:
  const handleMobileChange = (value: string) => {
    // Remove any non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (cleanValue.length <= 10) {
      setCustomerDetails(prev => ({ ...prev, mobile: cleanValue }));
      
      // Clear error when user starts typing
      if (mobileError) {
        setMobileError('');
      }
      
      // Validate mobile number in real-time
      if (cleanValue.length === 10) {
        if (!isValidMobileNumber(cleanValue)) {
          setMobileError('Mobile number must start with 6, 7, 8, or 9');
        }
      } else if (cleanValue.length > 0 && cleanValue.length < 10) {
        setMobileError('Mobile number must be 10 digits');
      }
    }
  };

// Add missing closing braces for disabled attribute conditions:
                    disabled={
                      !customerDetails.name || 
                      !customerDetails.mobile || 
                      !customerDetails.roomNumber ||
                      customerDetails.mobile.length !== 10 ||
                      !/^[6-9]/.test(customerDetails.mobile)
                    }

// Add missing closing braces for the entire App component:
}

export default App;
```

The main issues were:

1. Missing closing brace for the handleMobileChange function
2. Duplicate disabled attribute conditions that needed to be merged
3. Missing closing braces for the App component and export statement

The file should now be syntactically correct and properly structured.