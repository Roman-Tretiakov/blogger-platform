import {validationResult, ValidationError} from 'express-validator';
import {Request, Response, NextFunction} from 'express';
import {HttpStatus} from '../enums/http-status';
import {ValidationErrorType} from '../types/validation-error-type';

const formatErrors = (error: ValidationError): ValidationErrorType => {

    return {
        field: error.type,  // Поле с ошибкой
        message: error.msg,  // Сообщение ошибки
    };
};

export const inputValidationResultMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const errors = validationResult(req).formatWith(formatErrors).array({ onlyFirstError: true });

    if (errors.length) {
        res.status(HttpStatus.BadRequest).json({errorMessage: errors})
        return;
    }

    next();
}