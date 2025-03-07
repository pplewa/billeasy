"use client";

import * as React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { InvoiceType } from "@/types-optional";

interface SortableItemProps {
  id: string;
  index: number;
  onRemove: () => void;
}

function SortableItem({ id, index, onRemove }: SortableItemProps) {
  const { register, watch, setValue } = useFormContext<InvoiceType>();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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

  // Within the SortableItem component, update to include enable/disable toggles
  const [taxEnabled, setTaxEnabled] = React.useState(false);
  const [discountEnabled, setDiscountEnabled] = React.useState(false);
  
  // Initialize checkbox states based on existing data
  React.useEffect(() => {
    // If taxObj exists and has amount, enable tax checkbox
    if (taxObj && typeof taxObj.amount === 'number') {
      setTaxEnabled(true);
    }
    
    // If discountObj exists and has amount, enable discount checkbox
    if (discountObj && typeof discountObj.amount === 'number') {
      setDiscountEnabled(true);
    }
  }, []);

  // Initialize tax and discount when they are enabled
  React.useEffect(() => {
    if (taxEnabled && (!taxObj || taxObj.amount === undefined)) {
      setValue(`details.items.${index}.tax`, { amount: 0, amountType: 'percentage' });
    } else if (!taxEnabled && taxObj) {
      setValue(`details.items.${index}.tax`, undefined);
    }
  }, [taxEnabled, taxObj, index, setValue]);

  React.useEffect(() => {
    if (discountEnabled && (!discountObj || discountObj.amount === undefined)) {
      setValue(`details.items.${index}.discount`, { amount: 0, amountType: 'percentage' });
    } else if (!discountEnabled && discountObj) {
      setValue(`details.items.${index}.discount`, undefined);
    }
  }, [discountEnabled, discountObj, index, setValue]);

  // Watch fields and calculate total
  React.useEffect(() => {
    try {
      // Only proceed if we have the necessary values
      const qty = quantity === undefined || quantity === null || quantity === '' ? 0 : Number(quantity);
      const price = unitPrice === undefined || unitPrice === null || unitPrice === '' ? 0 : Number(unitPrice);
      
      // Calculate base amount
      let total = qty * price;
      
      // Apply tax if available and enabled
      if (taxEnabled && taxObj && taxObj.amount !== undefined && taxObj.amount !== null && taxObj.amount !== '') {
        const taxAmount = Number(taxObj.amount || 0);
        if (taxObj.amountType === 'percentage') {
          total += (total * taxAmount) / 100;
        } else if (taxObj.amountType === 'fixed') {
          total += taxAmount;
        }
      }
      
      // Apply discount if available and enabled
      if (discountEnabled && discountObj && discountObj.amount !== undefined && discountObj.amount !== null && discountObj.amount !== '') {
        const discountAmount = Number(discountObj.amount || 0);
        if (discountObj.amountType === 'percentage') {
          total -= (total * discountAmount) / 100;
        } else if (discountObj.amountType === 'fixed') {
          total -= discountAmount;
        }
      }
      
      // Round to 2 decimal places and update the total
      total = Math.round(total * 100) / 100;
      setValue(`details.items.${index}.total`, total);
    } catch (error) {
      console.error("Error calculating total:", error);
    }
  }, [quantity, unitPrice, taxObj, discountObj, taxEnabled, discountEnabled, index, setValue]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-4 p-4 bg-background rounded-lg border mb-4"
    >
      <button
        type="button"
        className="mt-8 cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Item Name"
              {...register(`details.items.${index}.name`)}
              placeholder="Item name"
            />
          </div>

          <div>
            <FormInput
              label="Quantity"
              type="number"
              {...register(`details.items.${index}.quantity`, {
                valueAsNumber: true,
              })}
              placeholder="0"
            />
          </div>

          <div>
            <FormInput
              label="Unit Price"
              type="number"
              step="0.01"
              {...register(`details.items.${index}.unitPrice`, {
                valueAsNumber: true,
              })}
              placeholder="0.00"
            />
          </div>

          <div>
            <FormInput
              label="Total"
              type="number"
              step="0.01"
              {...register(`details.items.${index}.total`, {
                valueAsNumber: true,
              })}
              readOnly
              placeholder="0.00"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="mt-6"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Fields */}
          <div className="border p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Tax</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`tax-enabled-${index}`}
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`tax-enabled-${index}`} className="text-xs">Enable</label>
              </div>
            </div>
            
            {taxEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="Amount"
                  type="number"
                  step="0.01"
                  {...register(`details.items.${index}.tax.amount`, {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    {...register(`details.items.${index}.tax.amountType`)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Discount Fields */}
          <div className="border p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Discount</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`discount-enabled-${index}`}
                  checked={discountEnabled}
                  onChange={(e) => setDiscountEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`discount-enabled-${index}`} className="text-xs">Enable</label>
              </div>
            </div>
            
            {discountEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  label="Amount"
                  type="number"
                  step="0.01"
                  {...register(`details.items.${index}.discount.amount`, {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    {...register(`details.items.${index}.discount.amountType`)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Items() {
  const { control } = useFormContext<InvoiceType>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "details.items",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableItem
                key={field.id?.toString() || index.toString()}
                id={field.id?.toString() || index.toString()}
                index={index}
                onRemove={() => remove(index)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const newItem: Partial<ItemType> = {
              id: crypto.randomUUID(),
              name: "",
              quantity: 1,
              unitPrice: 0,
              total: 0,
              // Explicitly set undefined to allow toggles to work properly
              tax: undefined,
              discount: undefined
            };
            append(newItem);
          }}
          className="mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}