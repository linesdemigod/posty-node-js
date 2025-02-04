// helpers/validation.js
const validateFields = (fields) => {
  const errors = [];

  // Check for empty fields
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (!fieldValue || fieldValue.trim() === "") {
      errors.push(`${fieldName} is required`);
    }
  }

  // Specific validation rules
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.push("Email must be a valid email address");
  }

  if (
    fields.password &&
    (fields.password.length < 6 || fields.password.length > 128)
  ) {
    errors.push("Password must be between 8 and 128 characters");
  }

  return errors;
};

module.exports = { validateFields };
