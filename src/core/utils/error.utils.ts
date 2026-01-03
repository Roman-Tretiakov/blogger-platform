import {ValidationError} from "../types/validation-error-type";

export const createErrorMessages = (
    errors: ValidationError[],
): { errorsMessages: ValidationError[] } => {
    return { errorsMessages: errors };
};