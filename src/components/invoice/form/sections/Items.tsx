'use client';

import * as React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { FormInvoiceType } from '@/types-optional';

interface SortableItemProps {
  id: string;
  index: number;
  onRemove: () => void;
  onDuplicate: () => void;
}

function SortableItem({ id, index, onRemove, onDuplicate }: SortableItemProps) {
  const { register, watch, setValue, getValues } = useFormContext<FormInvoiceType>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // Translation hook
  const t = useTranslations('form.items');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Watch quantity and unit price to calculate total
  const quantity = watch(`details.items.${index}.quantity`);
  const unitPrice = watch(`details.items.${index}.unitPrice`);
  const taxObj = watch(`details.items.${index}.tax`);
  const discountObj = watch(`details.items.${index}.discount`);
  // Watch amount types to recalculate on type change
  const taxAmountType = watch(`details.items.${index}.tax.amountType`);
  const discountAmountType = watch(`details.items.${index}.discount.amountType`);

  // CRITICAL FIX: Initialize tax and discount only when necessary
  // This should run only once per item or when objects are truly missing
  React.useEffect(() => {
    // For tax object - only initialize if completely missing or not an object
    if (!taxObj || typeof taxObj !== 'object') {
      setValue(`details.items.${index}.tax`, {
        amount: 0,
        amountType: 'fixed',
      });
    } else {
      // Only set amount if completely missing (don't overwrite valid zeros)
      if (taxObj.amount === undefined || taxObj.amount === null) {
        setValue(`details.items.${index}.tax.amount`, 0);
      }
      // Ensure amountType exists
      if (!taxObj.amountType) {
        setValue(`details.items.${index}.tax.amountType`, 'fixed');
      }
    }

    // For discount - similar approach
    if (discountObj === undefined || discountObj === null) {
      setValue(`details.items.${index}.discount`, {
        amount: 0,
        amountType: 'fixed',
      });
    } else if (typeof discountObj === 'number') {
      // Convert legacy format to object
      setValue(`details.items.${index}.discount`, {
        amount: discountObj,
        amountType: 'fixed',
      });
    } else if (typeof discountObj === 'object') {
      // Only set if completely missing
      if (discountObj.amount === undefined || discountObj.amount === null) {
        setValue(`details.items.${index}.discount.amount`, 0);
      }
      // Ensure amountType exists
      if (!discountObj.amountType) {
        setValue(`details.items.${index}.discount.amountType`, 'fixed');
      }
    }
  }, [index, setValue, taxObj, discountObj]); // Add dependencies so it runs only when these values change

  // Calculate total whenever any relevant value changes
  const calculateTotal = React.useCallback(() => {
    try {
      // Get the most current values (don't rely on watched values which might be stale)
      const currentQuantity = getValues(`details.items.${index}.quantity`);
      const currentPrice = getValues(`details.items.${index}.unitPrice`);
      const currentTaxObj = getValues(`details.items.${index}.tax`);
      const currentDiscountObj = getValues(`details.items.${index}.discount`);

      // More permissive handling of values
      const qty = !currentQuantity || isNaN(Number(currentQuantity)) ? 0 : Number(currentQuantity);
      const price = !currentPrice || isNaN(Number(currentPrice)) ? 0 : Number(currentPrice);

      // Calculate base amount
      let total = qty * price;

      // Process tax with proper type checking
      if (currentTaxObj && typeof currentTaxObj === 'object') {
        const taxAmount =
          currentTaxObj.amount === undefined ||
          currentTaxObj.amount === null ||
          isNaN(Number(currentTaxObj.amount))
            ? 0
            : Number(currentTaxObj.amount);

        const taxType = currentTaxObj.amountType || 'fixed';

        if (taxType === 'percentage') {
          total += (total * taxAmount) / 100;
        } else {
          total += taxAmount;
        }
      }

      // Process discount with proper type checking
      if (currentDiscountObj) {
        // Handle legacy numeric format
        if (typeof currentDiscountObj === 'number') {
          total -= currentDiscountObj;
        }
        // Handle object format
        else if (typeof currentDiscountObj === 'object') {
          const discountAmount =
            currentDiscountObj.amount === undefined ||
            currentDiscountObj.amount === null ||
            isNaN(Number(currentDiscountObj.amount))
              ? 0
              : Number(currentDiscountObj.amount);

          const discountType = currentDiscountObj.amountType || 'fixed';

          if (discountType === 'percentage') {
            total -= (total * discountAmount) / 100;
          } else {
            total -= discountAmount;
          }
        }
      }

      // Ensure total is never negative and rounded properly
      total = Math.max(0, Math.round(total * 100) / 100);
      setValue(`details.items.${index}.total`, total);
    } catch (error) {
      console.error('Error calculating total:', error);
      setValue(`details.items.${index}.total`, 0);
    }
  }, [index, setValue, getValues]);

  // Ensure tax values are properly registered with the form
  React.useEffect(() => {
    // This ensures the path to tax is properly registered with react-hook-form
    // If it's not properly registered, it might get lost during form submission
    register(`details.items.${index}.tax`);
    register(`details.items.${index}.tax.amount`);
    register(`details.items.${index}.tax.amountType`);

    // Same for discount
    register(`details.items.${index}.discount`);
    register(`details.items.${index}.discount.amount`);
    register(`details.items.${index}.discount.amountType`);
  }, [index, register]);

  // Watch fields and calculate total
  React.useEffect(() => {
    calculateTotal();
  }, [quantity, unitPrice, taxObj, discountObj, taxAmountType, discountAmountType, calculateTotal]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-background rounded-lg border mb-3 hover:border-primary/50 transition-colors"
    >
      <button type="button" className="cursor-grab touch-none" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 grid grid-cols-12 gap-2 items-center">
        {/* Item Name */}
        <div className="col-span-3">
          <FormInput
            {...register(`details.items.${index}.name`)}
            placeholder={t('namePlaceholder')}
            className="h-6"
          />
          <hr className="m-1" />
          <FormInput {...register(`details.items.${index}.description`)} className="h-6" />
        </div>

        {/* Quantity */}
        <div className="col-span-1">
          <FormInput
            type="number"
            {...register(`details.items.${index}.quantity`, {
              setValueAs: (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
            })}
            placeholder={t('quantity')}
            className="h-14"
            onBlur={calculateTotal}
          />
        </div>

        {/* Unit Price */}
        <div className="col-span-2">
          <FormInput
            type="number"
            step="0.01"
            {...register(`details.items.${index}.unitPrice`, {
              setValueAs: (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
            })}
            placeholder={t('price')}
            className="h-14"
            onBlur={calculateTotal}
          />
        </div>

        {/* Discount */}
        <div className="col-span-2 flex items-center space-x-1">
          <FormInput
            type="number"
            step="0.01"
            {...register(`details.items.${index}.discount.amount`, {
              setValueAs: (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
            })}
            placeholder={t('discount')}
            className="h-14"
            onBlur={(e) => {
              // Ensure we persist values
              if (e.target.value === '') {
                setValue(`details.items.${index}.discount.amount`, 0);
              }
              calculateTotal();
            }}
          />

          <select
            {...register(`details.items.${index}.discount.amountType`)}
            className="h-14 w-10 rounded-md border text-xs"
            onChange={(e) => {
              // Set the value directly and then calculate
              const newAmountType = e.target.value;
              setValue(`details.items.${index}.discount.amountType`, newAmountType);

              // Force immediate recalculation with the new type
              const currentAmount = getValues(`details.items.${index}.discount.amount`) || 0;
              const currentQuantity = getValues(`details.items.${index}.quantity`) || 0;
              const currentPrice = getValues(`details.items.${index}.unitPrice`) || 0;

              // Calculate base amount
              let total = currentQuantity * currentPrice;

              // Apply any existing tax
              const taxObj = getValues(`details.items.${index}.tax`);
              if (taxObj && typeof taxObj === 'object') {
                const taxAmount = taxObj.amount || 0;
                const taxType = taxObj.amountType || 'fixed';

                if (taxType === 'percentage') {
                  total += (total * taxAmount) / 100;
                } else {
                  total += taxAmount;
                }
              }

              // Apply discount with new amountType
              if (newAmountType === 'percentage') {
                total -= (total * currentAmount) / 100;
              } else {
                total -= Number(currentAmount);
              }

              // Update total immediately
              setValue(`details.items.${index}.total`, Math.max(0, Math.round(total * 100) / 100));
            }}
          >
            <option value="percentage">%</option>
            <option value="fixed">$</option>
          </select>
        </div>

        {/* Tax */}
        <div className="col-span-2 flex items-center space-x-1">
          <FormInput
            type="number"
            step="0.01"
            {...register(`details.items.${index}.tax.amount`, {
              setValueAs: (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
            })}
            placeholder={t('tax')}
            className="h-14"
            onBlur={(e) => {
              // Force persistence on blur
              const value = e.target.value === '' ? 0 : Number(e.target.value);
              setValue(`details.items.${index}.tax.amount`, value);
              calculateTotal();
            }}
          />

          <select
            {...register(`details.items.${index}.tax.amountType`)}
            className="h-14 w-10 rounded-md border text-xs"
            onChange={(e) => {
              // Set the value directly and then calculate
              const newAmountType = e.target.value;
              setValue(`details.items.${index}.tax.amountType`, newAmountType);

              // Force immediate recalculation with the new type
              const currentAmount = getValues(`details.items.${index}.tax.amount`) || 0;
              const currentQuantity = getValues(`details.items.${index}.quantity`) || 0;
              const currentPrice = getValues(`details.items.${index}.unitPrice`) || 0;

              // Calculate base amount
              let total = currentQuantity * currentPrice;

              // Apply tax with new amountType
              if (newAmountType === 'percentage') {
                total += (total * currentAmount) / 100;
              } else {
                total += Number(currentAmount);
              }

              // Apply any existing discount
              const discountObj = getValues(`details.items.${index}.discount`);
              if (discountObj && typeof discountObj === 'object') {
                const discountAmount = discountObj.amount || 0;
                const discountType = discountObj.amountType || 'fixed';

                if (discountType === 'percentage') {
                  total -= (total * discountAmount) / 100;
                } else {
                  total -= discountAmount;
                }
              }

              // Update total immediately
              setValue(`details.items.${index}.total`, Math.max(0, Math.round(total * 100) / 100));
            }}
          >
            <option value="percentage">%</option>
            <option value="fixed">$</option>
          </select>
        </div>

        {/* Total - made visually more distinct */}
        <div className="col-span-2 flex items-center">
          <FormInput
            type="number"
            step="0.01"
            {...register(`details.items.${index}.total`, {
              setValueAs: (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
            })}
            readOnly
            placeholder="0.00"
            className="h-14 font-medium bg-secondary/50 border-secondary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDuplicate}
          className="h-8 w-8"
          title={t('duplicate')}
        >
          <Copy className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title={t('remove')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Items() {
  const { control, getValues } = useFormContext<FormInvoiceType>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'details.items',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Translation hook
  const t = useTranslations('form.items');

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over?.id);
      move(oldIndex, newIndex);
    }
  }

  // Create an array of IDs for SortableContext
  const itemIds = fields.map((field) => field.id?.toString() || '');

  // Function to duplicate an item with deep cloning to prevent reference issues
  const duplicateItem = (index: number) => {
    const itemToDuplicate = getValues(`details.items.${index}`);
    // Deep clone to ensure we don't share object references
    const newItem = JSON.parse(
      JSON.stringify({
        ...itemToDuplicate,
        id: crypto.randomUUID(),
      })
    );
    append(newItem);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 px-12 mb-2 text-sm font-medium text-muted-foreground">
          <div className="col-span-3">{t('name')}</div>
          <div className="col-span-1">{t('quantity')}</div>
          <div className="col-span-2">{t('price')}</div>
          <div className="col-span-2">{t('discount')}</div>
          <div className="col-span-2">{t('tax')}</div>
          <div className="col-span-2">{t('amount')}</div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {fields.map((field, index) => (
              <SortableItem
                key={field.id?.toString() || index.toString()}
                id={field.id?.toString() || index.toString()}
                index={index}
                onRemove={() => remove(index)}
                onDuplicate={() => duplicateItem(index)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <div className="flex justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newItem = {
                id: crypto.randomUUID(),
                name: '',
                quantity: 1,
                unitPrice: 0,
                total: 0,
                tax: { amount: 0, amountType: 'fixed' },
                discount: { amount: 0, amountType: 'fixed' },
              };
              append(newItem);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addItem')}
          </Button>

          {fields.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {t('itemCount', { count: fields.length })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
