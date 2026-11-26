const { isObjectIdOrHexString } = require("mongoose");
const { ApiError } = require("./apiErrors");

const text = (value) => typeof value === "string" && value.trim().length > 0 && value.length <= 128;
const optionalText = (value) => typeof value === "string" && value.length <= 500;
const id = (value) => typeof value === "string" && isObjectIdOrHexString(value);
const date = (value) => typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().startsWith(value.slice(0, 10));
const positiveInteger = (value) => Number.isSafeInteger(value) && value > 0;
const oneOf = (...values) => (value) => values.includes(value);

function validateIds(...names) {
  return (req, res, next) => {
    if (names.some((name) => !id(req.params[name]))) throw new ApiError(400, "Invalid record ID.");
    next();
  };
}

function validateBody(required, optional = {}) {
  return (req, res, next) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).some((key) => !Object.hasOwn(required, key) && !Object.hasOwn(optional, key)) ||
        Object.entries(required).some(([key, predicate]) => !predicate(body[key])) ||
        Object.entries(optional).some(([key, predicate]) => Object.hasOwn(body, key) && !predicate(body[key]))) {
      throw new ApiError(400, "Invalid request data.");
    }
    next();
  };
}

function validateCycleDates(req, res, next) {
  if (Date.parse(req.body.startDate) > Date.parse(req.body.endDate)) {
    throw new ApiError(400, "End date must be on or after start date.");
  }
  next();
}

const cycleFields = { cycleName: text, startDate: date, endDate: date, durationDays: positiveInteger };

module.exports = {
  cycleFields,
  date, id, oneOf, optionalText, positiveInteger, text, validateBody, validateCycleDates, validateIds,
};
