import {ValidationErrorType} from "../types/validation-error-type";

export const createErrorMessages = (errors: ValidationErrorType[]): { errorsMessages: ValidationErrorType[] } => {
    return { errorsMessages: errors };
};