// @opencorestack/opengridx/ai: schema and validator for driving the grid from a language model.
// No React, no dependencies and no AI SDK; the app sends the schema to its own model.
export { getGridAiSchema } from './schema';
export { validateGridAiState } from './validate';
export type {
  GridAiColumn,
  GridAiJsonSchema,
  GridAiPart,
  GridAiPartOptions,
  GridAiSchema,
  GridAiSchemaOptions,
  GridAiState,
  GridAiValidateOptions,
  GridAiValidationError,
  GridAiValidationResult,
} from './types';
