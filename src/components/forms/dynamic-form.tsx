"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    FormConfig,
    FormFieldConfig,
    jsonToZodSchema,
    getFormDefaults,
} from "@/lib/forms/json-to-zod"

interface DynamicFormProps {
    config: FormConfig
    onSubmit: (data: Record<string, unknown>) => void
    submitLabel?: string
    isLoading?: boolean
}

/**
 * Dinamik Form Bileşeni
 * Reference.md Bölüm 5 - JSON Schema -> Zod -> React Hook Form
 * 
 * useMemo ile şema memoizasyonu (Bölüm 5.3)
 */
export function DynamicForm({
    config,
    onSubmit,
    submitLabel = "Gönder",
    isLoading = false,
}: DynamicFormProps) {
    // Şema memoizasyonu - Reference.md Bölüm 5.3
    const schema = React.useMemo(() => jsonToZodSchema(config), [config])
    const defaults = React.useMemo(() => getFormDefaults(config), [config])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaults,
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {config.fields.map((field) => (
                <FormField
                    key={field.name}
                    field={field}
                    register={register}
                    error={errors[field.name]?.message as string | undefined}
                />
            ))}
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Gönderiliyor..." : submitLabel}
            </Button>
        </form>
    )
}

interface FormFieldProps {
    field: FormFieldConfig
    register: ReturnType<typeof useForm>["register"]
    error?: string
}

function FormField({ field, register, error }: FormFieldProps) {
    const inputId = `field-${field.name}`

    return (
        <div className="space-y-2">
            <Label htmlFor={inputId}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === "select" ? (
                <select
                    id={inputId}
                    {...register(field.name)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="">Seçiniz...</option>
                    {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : field.type === "textarea" ? (
                <textarea
                    id={inputId}
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
            ) : field.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                    <input
                        id={inputId}
                        type="checkbox"
                        {...register(field.name)}
                        className="h-4 w-4 rounded border-input"
                    />
                    <span className="text-sm text-muted-foreground">
                        {field.placeholder}
                    </span>
                </div>
            ) : (
                <Input
                    id={inputId}
                    type={field.type}
                    placeholder={field.placeholder}
                    {...register(field.name, {
                        valueAsNumber: field.type === "number",
                    })}
                />
            )}

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}
