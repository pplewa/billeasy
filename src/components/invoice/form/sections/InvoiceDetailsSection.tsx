"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

import { InvoiceType } from "@/types";

// Currency type definition
type Currency = {
  code: string;
  name: string;
};

type CurrencyDetails = {
  currency: string;
  decimals: number;
  beforeDecimal: string;
  afterDecimal: string | null;
};

export function InvoiceDetailsSection() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<InvoiceType>();
  
  const invoiceDate = watch("details.invoiceDate");
  const dueDate = watch("details.dueDate");
  const selectedCurrency = watch("details.currency");
  
  const [open, setOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  
  // Load currencies from JSON file
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        // In Next.js, files in the public directory are served at the root path
        const response = await fetch('/assets/data/currencies.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch currencies: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform the data into the format we need and sort alphabetically
        const formattedCurrencies = Object.entries(data)
          .map(([code, details]) => ({
            code,
            name: (details as CurrencyDetails).currency
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setCurrencies(formattedCurrencies);
      } catch (error) {
        console.error("Failed to load currencies:", error);
        // Fallback to default currencies if loading fails
        setCurrencies([
          { code: "USD", name: "United States Dollar" },
          { code: "EUR", name: "Euro" },
          { code: "GBP", name: "British Pound" },
          { code: "JPY", name: "Japanese Yen" },
          { code: "CAD", name: "Canadian Dollar" },
          { code: "AUD", name: "Australian Dollar" },
          { code: "INR", name: "Indian Rupee" },
        ]);
      }
    };
    
    loadCurrencies();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Invoice Number"
          {...register("details.invoiceNumber")}
          error={errors.details?.invoiceNumber?.message}
          placeholder="INV-001"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Invoice Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !invoiceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoiceDate ? format(new Date(invoiceDate), "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={invoiceDate ? new Date(invoiceDate) : undefined}
                  onSelect={(date) => setValue("details.invoiceDate", date as Date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.details?.invoiceDate?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.invoiceDate.message}
              </p>
            )}
          </div>
          
          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(new Date(dueDate), "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => setValue("details.dueDate", date as Date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.details?.dueDate?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.dueDate.message}
              </p>
            )}
          </div>
        </div>
        
        {/* Searchable Currency Combobox */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedCurrency ? 
                  currencies.find(c => c.code === selectedCurrency)?.code + " - " + 
                  currencies.find(c => c.code === selectedCurrency)?.name : 
                  "Select currency"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search currency..." className="h-9" />
                <CommandEmpty>No currency found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {currencies.map((currency) => (
                    <CommandItem
                      key={currency.code}
                      value={currency.code}
                      onSelect={(currentValue) => {
                        setValue("details.currency", currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCurrency === currency.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {currency.code} - {currency.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.details?.currency?.message && (
            <p className="text-sm font-medium text-destructive">
              {errors.details.currency.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 