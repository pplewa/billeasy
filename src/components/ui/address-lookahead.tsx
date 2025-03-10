'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/ui';
import { Check, Loader2, Search, Edit, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

// Define the address suggestion type
interface AddressSuggestion {
  placeId: string;
  description: string;
}

// Define the address details type
interface AddressDetails {
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

type AddressMode = 'lookahead' | 'manual';

interface AddressLookaheadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  label?: string;
  error?: string;
  onAddressSelect?: (address: AddressDetails) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  defaultValue?: string;
  // Form registration values
  cityValue?: string;
  zipCodeValue?: string;
  countryValue?: string;
  onCityChange?: (value: string) => void;
  onZipCodeChange?: (value: string) => void;
  onCountryChange?: (value: string) => void;
  // Explicit mode control
  forceManualMode?: boolean;
}

/**
 * AddressLookahead component that provides address autocomplete functionality
 * This version supports two modes: lookahead and manual input
 */
const AddressLookahead = forwardRef<HTMLInputElement, AddressLookaheadProps>(
  (
    {
      label,
      error,
      className,
      onAddressSelect,
      onChange,
      value,
      defaultValue,
      cityValue = '',
      zipCodeValue = '',
      countryValue = '',
      onCityChange,
      onZipCodeChange,
      onCountryChange,
      forceManualMode = false,
      ...props
    },
    ref
  ) => {
    const t = useTranslations('form');

    // Mode state
    const [mode, setMode] = useState<AddressMode>(() => {
      // Start in manual mode if forced or if address values are already populated
      if (
        forceManualMode ||
        ((value || defaultValue) && (cityValue || zipCodeValue || countryValue))
      ) {
        return 'manual';
      }
      return 'lookahead';
    });

    // Update mode when forceManualMode changes
    useEffect(() => {
      if (forceManualMode) {
        setMode('manual');
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Input state
    const [inputValue, setInputValue] = useState<string>(value || defaultValue || '');

    // Dropdown state
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Focus tracking
    const [isFocused, setIsFocused] = useState(false);

    // References
    const inputRef = useRef<HTMLInputElement>(null);
    const activeIndexRef = useRef(-1);

    // Selected address details
    const [addressDetails, setAddressDetails] = useState<AddressDetails>({
      address: value || '',
      city: cityValue || '',
      zipCode: zipCodeValue || '',
      country: countryValue || '',
    });

    // Update local state when props change
    useEffect(() => {
      setAddressDetails({
        address: value || '',
        city: cityValue || '',
        zipCode: zipCodeValue || '',
        country: countryValue || '',
      });
    }, [value, cityValue, zipCodeValue, countryValue]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setAddressDetails((prev) => ({ ...prev, address: value }));

      if (onChange) {
        onChange(e);
      }

      // Reset error state when user starts typing
      if (apiError) {
        setApiError(null);
      }

      if (!value || value.length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      // Open the dropdown when we start searching
      setOpen(true);
      setLoading(true);
      activeIndexRef.current = -1;

      // Use our backend API instead of calling Google Maps directly
      fetchSuggestions(value);
    };

    // Fetch address suggestions from our backend API
    const fetchSuggestions = async (input: string) => {
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch suggestions');
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
        // Keep dropdown open if we have suggestions and input is focused
        if ((data.suggestions || []).length > 0 && isFocused) {
          setOpen(true);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Handle address selection
    const handleAddressSelect = async (suggestion: AddressSuggestion) => {
      // Update input value immediately for better UX
      setInputValue(suggestion.description);

      // For UX improvement, close dropdown after selection
      setOpen(false);
      setLoading(true);

      try {
        const response = await fetch(
          `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch address details');
        }

        const data = await response.json();

        if (data.addressDetails) {
          // Clean up the address by removing duplicate information
          const cleanedAddress = cleanAddressField(
            data.addressDetails.address,
            data.addressDetails.city,
            data.addressDetails.zipCode,
            data.addressDetails.country
          );

          // Update local state with cleaned address
          setAddressDetails({
            ...data.addressDetails,
            address: cleanedAddress,
          });

          // Switch to manual mode to show all fields
          setMode('manual');

          // Call the callback with cleaned address
          if (onAddressSelect) {
            onAddressSelect({
              ...data.addressDetails,
              address: cleanedAddress,
            });
          }

          // Update parent form values if callbacks exist
          if (onCityChange) onCityChange(data.addressDetails.city);
          if (onZipCodeChange) onZipCodeChange(data.addressDetails.zipCode);
          if (onCountryChange) onCountryChange(data.addressDetails.country);
        }
      } catch (error) {
        console.error('Error fetching address details:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to fetch address details');
      } finally {
        setLoading(false);
      }
    };

    // Clean up address field by removing duplicate city, zip code, and country information
    const cleanAddressField = (
      fullAddress: string,
      city: string,
      zipCode: string,
      country: string
    ): string => {
      let cleanedAddress = fullAddress;

      // First, try to identify and extract the street address portion
      // This is typically the first part before state/province, postal code, country
      const parts = fullAddress.split(',').map((part) => part.trim());

      if (parts.length > 1) {
        // Extract what's likely to be the street address
        // This is usually the first component, sometimes with the second if it contains building info
        if (parts.length >= 3) {
          // Try to identify if we need just the first part or the first two parts
          // Check if second part contains apartment/suite/unit info
          const firstPartOnly = !parts[1].match(/apt|suite|unit|floor|#/i);
          cleanedAddress = firstPartOnly ? parts[0] : `${parts[0]}, ${parts[1]}`;
        } else {
          // If we only have two parts, take the first one as the street address
          cleanedAddress = parts[0];
        }
      }

      // Fallback: If the above approach doesn't work well, apply regex replacements
      if (cleanedAddress === fullAddress) {
        // Create regex patterns to match city, zip code, and country in the address
        if (city && city.trim() !== '') {
          // Match city followed by state/country
          cleanedAddress = cleanedAddress.replace(
            new RegExp(`${city}[,\\s]+(?:[A-Z]{2,}|[^,]+)[,\\s]+${country}`, 'i'),
            ''
          );
          // Match city at the end or followed by comma
          cleanedAddress = cleanedAddress.replace(new RegExp(`,?\\s*${city}(?:,|$)`, 'i'), '');
        }

        if (zipCode && zipCode.trim() !== '') {
          // Match postal/zip codes in various formats
          cleanedAddress = cleanedAddress.replace(new RegExp(`\\b${zipCode}\\b`, 'i'), '');
        }

        if (country && country.trim() !== '') {
          // Match country at the end of the address
          cleanedAddress = cleanedAddress.replace(new RegExp(`,?\\s*${country}$`, 'i'), '');
        }

        // Look for state/province codes (e.g., NY, CA, NSW, VIC)
        cleanedAddress = cleanedAddress.replace(/,\s*[A-Z]{2,3}(?:,|$)/g, '');
      }

      // Remove multiple commas, extra spaces, and clean up trailing commas
      cleanedAddress = cleanedAddress.replace(/,\s*,/g, ',');
      cleanedAddress = cleanedAddress.replace(/,\s*$/g, '');
      cleanedAddress = cleanedAddress.replace(/\s{2,}/g, ' ');

      return cleanedAddress.trim();
    };

    // Toggle between lookahead and manual modes
    const toggleMode = () => {
      setMode(mode === 'lookahead' ? 'manual' : 'lookahead');
    };

    // Handle manual field changes
    const handleManualFieldChange = (field: keyof AddressDetails, value: string) => {
      setAddressDetails((prev) => ({ ...prev, [field]: value }));

      // Update parent form if callbacks exist
      if (field === 'city' && onCityChange) onCityChange(value);
      if (field === 'zipCode' && onZipCodeChange) onZipCodeChange(value);
      if (field === 'country' && onCountryChange) onCountryChange(value);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Close dropdown on escape
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (!open || suggestions.length === 0) {
        // Open dropdown on arrow down even if we don't have suggestions yet
        if (e.key === 'ArrowDown' && inputValue.length >= 3) {
          e.preventDefault();
          setOpen(true);
          return;
        }
        return;
      }

      // Handle keyboard navigation for suggestions
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndexRef.current = Math.min(activeIndexRef.current + 1, suggestions.length - 1);
        const elements = document.querySelectorAll('.address-suggestion-item');
        if (elements[activeIndexRef.current]) {
          (elements[activeIndexRef.current] as HTMLElement).focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndexRef.current = Math.max(activeIndexRef.current - 1, -1);
        if (activeIndexRef.current === -1) {
          inputRef.current?.focus();
        } else {
          const elements = document.querySelectorAll('.address-suggestion-item');
          if (elements[activeIndexRef.current]) {
            (elements[activeIndexRef.current] as HTMLElement).focus();
          }
        }
      } else if (e.key === 'Enter' && activeIndexRef.current >= 0) {
        e.preventDefault();
        handleAddressSelect(suggestions[activeIndexRef.current]);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {label && <Label htmlFor={props.id}>{label}</Label>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="h-8 gap-1"
          >
            {mode === 'lookahead' ? (
              <>
                <Edit className="h-3.5 w-3.5" />
                <span>{t('addressLookahead.manualEntry')}</span>
              </>
            ) : (
              <>
                <Map className="h-3.5 w-3.5" />
                <span>{t('addressLookahead.searchAddress')}</span>
              </>
            )}
          </Button>
        </div>

        {mode === 'lookahead' ? (
          // Lookahead Mode UI
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              {/* Loading indicator inside the input field */}
              {loading && (
                <div className="absolute right-3 top-2.5 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              <Input
                ref={(node) => {
                  // Handle both the forwarded ref and our local ref
                  if (typeof ref === 'function') {
                    ref(node);
                  } else if (ref) {
                    ref.current = node;
                  }
                  inputRef.current = node;
                }}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                  setIsFocused(true);
                  // Show suggestions if we already have some
                  if (suggestions.length > 0) {
                    setOpen(true);
                  }
                }}
                onBlur={(e) => {
                  // Don't blur when clicking on a suggestion item
                  if (e.relatedTarget && e.relatedTarget.closest('.address-suggestion-item')) {
                    return;
                  }
                  setIsFocused(false);
                  // Close the dropdown after a short delay
                  setTimeout(() => {
                    setOpen(false);
                  }, 150);
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  'pl-9 pr-9',
                  error && 'border-destructive focus-visible:ring-destructive',
                  className
                )}
                placeholder={t('addressLookahead.searchPlaceholder')}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-controls="address-suggestions"
                aria-describedby={error ? 'address-error' : undefined}
                autoComplete="off"
                {...props}
              />
            </div>

            {open && suggestions.length > 0 && (
              <div className="relative mt-1 w-full z-10">
                <div className="border border-input rounded-md shadow-md bg-popover">
                  <ul
                    id="address-suggestions"
                    role="listbox"
                    aria-label={t('addressLookahead.suggestions')}
                    className="py-2 overflow-auto max-h-60"
                  >
                    {!loading &&
                      suggestions.map((suggestion, index) => (
                        <li
                          key={suggestion.placeId}
                          id={`address-suggestion-${index}`}
                          role="option"
                          aria-selected={activeIndexRef.current === index}
                          tabIndex={0}
                          className={cn(
                            'px-2 py-2 text-sm cursor-pointer flex items-center justify-between address-suggestion-item',
                            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none'
                          )}
                          onClick={() => handleAddressSelect(suggestion)}
                          onMouseDown={(e) => {
                            // Prevent input blur
                            e.preventDefault();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAddressSelect(suggestion);
                            }
                          }}
                          onMouseEnter={() => {
                            activeIndexRef.current = index;
                          }}
                          onFocus={() => {
                            activeIndexRef.current = index;
                          }}
                        >
                          <span>{suggestion.description}</span>
                          {inputValue === suggestion.description && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </li>
                      ))}
                  </ul>
                  {apiError && (
                    <div className="p-2 text-sm text-destructive">
                      {t('addressLookahead.error')} {apiError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p id="address-error" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
          </div>
        ) : (
          // Manual Mode UI - Shows all address fields for editing
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input
                value={addressDetails.address}
                onChange={(e) => handleManualFieldChange('address', e.target.value)}
                className={cn(error && 'border-destructive')}
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={addressDetails.city}
                  onChange={(e) => handleManualFieldChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Zip/Postal Code</Label>
                <Input
                  value={addressDetails.zipCode}
                  onChange={(e) => handleManualFieldChange('zipCode', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={addressDetails.country}
                  onChange={(e) => handleManualFieldChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

AddressLookahead.displayName = 'AddressLookahead';

export { AddressLookahead, type AddressDetails };
