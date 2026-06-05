export class BQMSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BQMSError";
  }
}

export class ValidationError extends BQMSError {
  constructor(message: string = "Validation failed for the provided input") {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends BQMSError {
  constructor(message: string = "You are not authorized to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class BusinessRuleError extends BQMSError {
  constructor(message: string = "A business rule violation occurred") {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class IntegrationError extends BQMSError {
  constructor(message: string = "An error occurred with an external integration") {
    super(message);
    this.name = "IntegrationError";
  }
}
