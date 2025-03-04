"use client";

import { useFormContext } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { InvoiceType } from "@/types";

// Sample currencies - in a real app, these would come from an API or config
const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
];

// Sample languages - in a real app, these would come from an API or config
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
];

export function InvoiceDetailsSection() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<InvoiceType>();
  
  const invoiceDate = watch("details.invoiceDate");
  const dueDate = watch("details.dueDate");

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Currency */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select 
              onValueChange={(value) => setValue("details.currency", value)}
              defaultValue={watch("details.currency")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.details?.currency?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.currency.message}
              </p>
            )}
          </div>
          
          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select 
              onValueChange={(value) => setValue("details.language", value)}
              defaultValue={watch("details.language")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.details?.language?.message && (
              <p className="text-sm font-medium text-destructive">
                {errors.details.language.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 