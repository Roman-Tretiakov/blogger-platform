import {ValidationError} from "../types/validation-error-type";

export function createErrorMessages (errors: ValidationError[]): { errorMessages: ValidationError[] } {
    return { errorMessages: errors };
}