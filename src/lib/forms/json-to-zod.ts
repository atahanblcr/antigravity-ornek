import { z } from "zod"

/**
 * JSON Form Field Tipi
 * Reference.md Bölüm 5.1 - Dinamik Form Motoru
 */
export interface FormFieldConfig {
    name: string
    type: "text" | "number" | "email" | "tel" | "select" | "textarea" | "checkbox"
    label: string
    placeholder?: string
    required?: boolean
    options?: { value: string; label: string }[]
    validation?: {
        min?: number
        max?: number
        minLength?: number
        maxLength?: number
        pattern?: string
    }
}

export interface FormConfig {
    fields: FormFieldConfig[]
}

/**
 * JSON konfigürasyonundan Zod şeması oluşturur
 * Reference.md Bölüm 5.1 - JSON Schema -> Zod dönüşümü
 */
export function jsonToZodSchema(config: FormConfig): z.ZodObject<Record<string, z.ZodTypeAny>> {
    const shape: Record<string, z.ZodTypeAny> = {}

    for (const field of config.fields) {
        let fieldSchema: z.ZodTypeAny

        switch (field.type) {
            case "number":
                let numSchema = z.number()
                if (field.validation?.min !== undefined) {
                    numSchema = numSchema.min(field.validation.min)
                }
                if (field.validation?.max !== undefined) {
                    numSchema = numSchema.max(field.validation.max)
                }
                fieldSchema = field.required ? numSchema : numSchema.optional()
                break

            case "email":
                fieldSchema = field.required
                    ? z.string().email("Geçerli bir e-posta adresi giriniz")
                    : z.string().email().optional()
                break

            case "checkbox":
                fieldSchema = z.boolean()
                break

            case "select":
                if (field.options && field.options.length > 0) {
                    const values = field.options.map((o) => o.value) as [string, ...string[]]
                    fieldSchema = field.required
                        ? z.enum(values)
                        : z.enum(values).optional()
                } else {
                    fieldSchema = field.required ? z.string() : z.string().optional()
                }
                break

            case "text":
            case "textarea":
            case "tel":
            default:
                let strSchema = z.string()
                if (field.validation?.minLength !== undefined) {
                    strSchema = strSchema.min(field.validation.minLength)
                }
                if (field.validation?.maxLength !== undefined) {
                    strSchema = strSchema.max(field.validation.maxLength)
                }
                if (field.validation?.pattern) {
                    strSchema = strSchema.regex(new RegExp(field.validation.pattern))
                }
                fieldSchema = field.required
                    ? strSchema.min(1, `${field.label} zorunludur`)
                    : strSchema.optional()
                break
        }

        shape[field.name] = fieldSchema
    }

    return z.object(shape)
}

/**
 * Form varsayılan değerlerini oluşturur
 */
export function getFormDefaults(config: FormConfig): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    for (const field of config.fields) {
        switch (field.type) {
            case "number":
                defaults[field.name] = 0
                break
            case "checkbox":
                defaults[field.name] = false
                break
            default:
                defaults[field.name] = ""
        }
    }

    return defaults
}
