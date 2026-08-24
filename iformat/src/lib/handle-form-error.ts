import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { toast } from "sonner";
import { ApiError } from "./api/api-error";

export interface FormErrorOptions<T extends FieldValues> {
  fallbackMessage?: string;
  fieldAliasMap?: Record<string, Path<T>>;
  showToastIfFieldHandled?: boolean;
}

/**
 * Maps server/API errors directly to form fields and only shows toast notifications
 * for global, unmapped, or server-level errors (avoiding redundant toast popups).
 */
export function handleFormError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  options?: FormErrorOptions<T>
) {
  if (err instanceof ApiError) {
    const fieldErrors = err.getFieldErrors();
    const fieldKeys = Object.keys(fieldErrors);

    if (fieldKeys.length > 0) {
      let matchedAnyField = false;

      fieldKeys.forEach((rawField) => {
        const fieldName = (options?.fieldAliasMap?.[rawField] || rawField) as Path<T>;
        try {
          setError(fieldName, {
            type: "server",
            message: fieldErrors[rawField],
          });
          matchedAnyField = true;
        } catch {
          // Field not recognized in form schema
        }
      });

      // If at least one error was successfully rendered directly on a form element,
      // skip the toast message unless explicitly requested.
      if (matchedAnyField && !options?.showToastIfFieldHandled) {
        return;
      }
    }

    // Show toast for global / server-level errors (rate limiting 429, 500, network loss)
    toast.error(err.message || options?.fallbackMessage || "An unexpected error occurred.");
    return;
  }

  if (err instanceof Error) {
    toast.error(err.message || options?.fallbackMessage || "An error occurred.");
    return;
  }

  toast.error(options?.fallbackMessage || "An error occurred. Please try again.");
}
