"use client";

import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { InvoiceType } from "@/types";

export function AdditionalNotesSection() {
  const { register, formState: { errors } } = useFormContext<InvoiceType>();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Additional Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Textarea
            {...register("details.additionalNotes")}
            placeholder="Add any additional notes or terms and conditions..."
            className="min-h-[100px]"
          />
          {errors.details?.additionalNotes?.message && (
            <p className="text-sm font-medium text-destructive">
              {errors.details.additionalNotes.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 