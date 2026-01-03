import {ValidationError} from "../types/validation-error-type";

export const createErrorMessages = (
    errors: ValidationError[],
): { errorMessages: ValidationError[] } => {
    return { errorMessages: errors };
};