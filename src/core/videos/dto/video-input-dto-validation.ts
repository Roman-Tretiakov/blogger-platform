import {CreateVideoInputModel, UpdateVideoInputModel} from './video-input-dto';
import {ValidationError} from "../../types/validation-error-type";
import {AvailableResolutions} from "../../enums/available-resolutions";
import {ErrorNames} from "../../enums/error-names";

export const createVideoInputDtoValidation = (data: CreateVideoInputModel): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.title)
        errors.push({field: 'title', message: ErrorNames.TITLE_MISSING_ERROR})
    else {
        if (Object.prototype.toString.call(data.title) !== '[object String]')
            errors.push({field: 'title', message: ErrorNames.TITLE_TYPE_ERROR})
        else if (data.title.trim().length < 2 || data.title.trim().length > 40)
            errors.push({field: 'title', message: ErrorNames.TITLE_LENGTH_ERROR});
    }

    if (!data.author)
        errors.push({field: 'author', message: ErrorNames.AUTHOR_MISSING_ERROR});
    else {
        if (Object.prototype.toString.call(data.author) !== '[object String]')
            errors.push({field: 'author', message: ErrorNames.AUTHOR_TYPE_ERROR});
        else if (data.author.trim().length < 2 || data.author.trim().length > 20)
            errors.push({field: 'author', message: ErrorNames.AUTHOR_LENGTH_ERROR});
    }

    if (!data.availableResolutions)
        errors.push({field: 'availableResolutions', message: ErrorNames.AVAILABLE_RESOLUTIONS_MISSING_ERROR});
    else {
        if (!Array.isArray(data.availableResolutions))
            errors.push({field: 'availableResolutions', message: ErrorNames.AVAILABLE_RESOLUTIONS_TYPE_ERROR});
        else if (data.availableResolutions.length) {
            const existingResolutions: AvailableResolutions[] = Object.values(AvailableResolutions);
            if (data.availableResolutions.length > existingResolutions.length ||
                data.availableResolutions.length < 1) {
                errors.push({field: 'availableResolutions', message: ErrorNames.AVAILABLE_RESOLUTIONS_LENGTH_ERROR});
            }
            for (const resolution of data.availableResolutions) {
                if (!existingResolutions.includes(resolution as AvailableResolutions)) {
                    errors.push({
                        field: 'availableResolutions',
                        message: ErrorNames.AVAILABLE_RESOLUTIONS_VALUE_ERROR + resolution,
                    });
                    break;
                }
            }
        }
    }
    return errors;
};

export const updateVideoInputDtoValidation = (data: UpdateVideoInputModel): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (createVideoInputDtoValidation(data).length > 0) {
        errors.push(...createVideoInputDtoValidation(data));
        return errors;
    } else {
        if (!data.canBeDownloaded)
            errors.push({field: 'canBeDownloaded', message: ErrorNames.CAN_BE_DOWNLOADED_MISSING_ERROR});
        else if (Object.prototype.toString.call(data.canBeDownloaded) !== '[object Boolean]') {
            errors.push({field: 'canBeDownloaded', message: ErrorNames.CAN_BE_DOWNLOADED_TYPE_ERROR});
        }

        if (data.minAgeRestriction === undefined || Number.isNaN(data.minAgeRestriction))
            errors.push({field: 'minAgeRestriction', message: ErrorNames.MIN_AGE_RESTRICTION_MISSING_ERROR});
        else {
            if (Object.prototype.toString.call(data.minAgeRestriction) !== '[object Number]'
            && data.minAgeRestriction !== null)
                errors.push({field: 'minAgeRestriction', message: ErrorNames.MIN_AGE_RESTRICTION_TYPE_ERROR});
            else if (data.minAgeRestriction !== null) {
                if (data.minAgeRestriction < 1 || data.minAgeRestriction > 18) {
                    errors.push({field: 'minAgeRestriction', message: ErrorNames.MIN_AGE_RESTRICTION_RANGE_ERROR});
                }
            }
        }

        if (!data.publicationDate)
            errors.push({field: 'publicationDate', message: ErrorNames.PUBLICATION_DATE_MISSING_ERROR})
        else if (Object.prototype.toString.call(data.publicationDate) !== '[object String]')
            errors.push({field: 'publicationDate', message: ErrorNames.PUBLICATION_DATE_TYPE_ERROR});
        else {
            const date = new Date(data.publicationDate);
            if (isNaN(date.getTime()))
                errors.push({field: 'publicationDate', message: ErrorNames.PUBLICATION_DATE_FORMAT_ERROR});
        }
    }
    return errors;
}