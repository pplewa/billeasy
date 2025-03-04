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

import { InvoiceType } from "@/types";

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

  // Calculate and update total when quantity or unit price changes
  React.useEffect(() => {
    if (quantity && unitPrice) {
      const total = quantity * unitPrice;
      setValue(`details.items.${index}.total`, total);
    }
  }, [quantity, unitPrice, index, setValue]);

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

      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4">
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
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <SortableItem
                key={field.id}
                id={field.id}
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
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              name: "",
              quantity: 1,
              unitPrice: 0,
              total: 0,
            })
          }
          className="mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  );
}