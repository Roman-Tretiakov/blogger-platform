export enum ErrorNames {
  NAME_MISSING_ERROR = "Name is required",
  NAME_TYPE_ERROR = "Name must be string",
  NAME_LENGTH_ERROR = "Name must be between 1 and 15 symbols",

  TITLE_MISSING_ERROR = "Title is required",
  TITLE_TYPE_ERROR = "Title must be string",
  TITLE_LENGTH_ERROR = "Title must be between 1 and 30 symbols",

  CONTENT_MISSING_ERROR = "Content is required",
  CONTENT_TYPE_ERROR = "Content must be string",
  CONTENT_LENGTH_ERROR = "Content must be within acceptable values",

  DESCRIPTION_MISSING_ERROR = "Description is required",
  DESCRIPTION_TYPE_ERROR = "Description must be string",
  DESCRIPTION_LENGTH_ERROR = "Description length is invalid",

  WEBSITEURL_MISSING_ERROR = "Website url is required",
  WEBSITEURL_FORMAT_ERROR = "Website url does not match the pattern",
  WEBSITEURL_TYPE_ERROR = "Website must be string",
  WEBSITEURL_LENGTH_ERROR = "Website must be up to 100 symbols",

  BLOGID_MISSING_ERROR = "Blog id is required",
  BLOGID_TYPE_ERROR = "Blog id must be string",

  BODY_MISSING_ERROR = "Request body is required",
  QUERY_MISSING_ERROR = "Query parameters is required",

  ID_MISSING_ERROR = "ID is required",
  ID_TYPE_ERROR = "ID must be a string",
  ID_EMPTY_ERROR = "ID must not be empty",
  ID_FORMAT_ERROR = "Incorrect format of Mongo ID",

  PAGE_NUMBER_TYPE_ERROR = "Page number must be a positive integer",
  PAGE_SIZE_ERROR = "Page size must be between 1 and 100",
  SORT_BY_TYPE_ERROR = "Allowed sort fields: ",
  SORT_DIRECTION_TYPE_ERROR = "Sort direction must be one of: ",

  LOGIN_MISSING_ERROR = "Login field is required",
  LOGIN_TYPE_ERROR = "Login must be a string",
  LOGIN_EMPTY_ERROR = "Login must not be empty",
  LOGIN_LENGTH_ERROR = "Login field is required",
  LOGIN_FORMAT_ERROR = "Login has incorrect format",

  PASSWORD_MISSING_ERROR = "Password field is required",
  PASSWORD_EMPTY_ERROR = "Password must not be empty",
  PASSWORD_TYPE_ERROR = "Password must be a string",
  PASSWORD_LENGTH_ERROR = "Password field is required",

  EMAIL_MISSING_ERROR = "Email field is required",
  EMAIL_EMPTY_ERROR = "Email must not be empty",
  EMAIL_TYPE_ERROR = "Email must be a string",
  EMAIL_FORMAT_ERROR = "Email has incorrect format",

  FIELD_NOT_STRING = "Field must be string",
}