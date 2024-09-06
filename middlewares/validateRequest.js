const { Types } = require("mongoose");
const Joi = require("joi");
const { phone } = require("phone");
const { ResponseService } = require("../services/responseService");
const {
  passwordRegex,
  dateRegex,
  StatusCode,
  storyCategories,
  userStatus,
  storyStatus,
  storyResponseTypes,
  queryReasons,
  queryStatus,
  storyReportReasons,
} = require("../utils/constants");

const validateMongoId = (value, helpers) => {
  if (value && Types.ObjectId.isValid(value)) return Types.ObjectId(value);
  return helpers.message(`Invalid ${helpers.state?.path[0]}`);
};

const validateMobile = (value, helpers) => {
  if (value && phone(value).isValid) return value;
  return helpers.message(`Invalid ${helpers.state?.path[0]}`);
};

const paginationValidation = {
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).default(10),
  order: Joi.number().valid(1, -1).default(-1),
  orderBy: Joi.string().default("createdAt"),
};

const addStorySchemaKeys = {
  title: Joi.string().min(5).max(150).required(),
  description: Joi.string().min(50).required(),
  category: Joi.string().custom(validateMongoId, "Categoryid validation").required(),
  anonymousSharing: Joi.boolean(),
  status: Joi.string().valid(...storyStatus),
  media: Joi.object().keys({
    url: Joi.string().uri().required(),
    type: Joi.string().required(),
  }),
};

const addCategorySchemaKeys = {
  name: Joi.string().required(),
  iconRegular: Joi.string().required(),
  iconFilled: Joi.string().required(),
};

const emailSchemaKey = {
  email: Joi.string().email().required().lowercase(),
};

module.exports = {
  commonSchema: {
    paginationSchema: Joi.object()
      .keys({
        ...paginationValidation,
      })
      .unknown(true),
  },

  authSchemas: {
    registrationSchema: Joi.object()
      .keys({
        ...emailSchemaKey,
        name: Joi.string()
          .pattern(/^[a-zA-Z0-9 ]+$/)
          .messages({
            "string.pattern.base": `Name can have only alphabets and numbers`,
          })
          .min(3)
          .max(30)
          .required(),
        mobile: Joi.string().required().custom(validateMobile, "Mobile validation").required(),
        password: Joi.string()
          .pattern(new RegExp(passwordRegex))
          .messages({
            "string.pattern.base": `The password needs to be at least eight characters long and contain capital, lowercase, numbers, and special characters.`,
          })
          .required(),
        status: Joi.string().valid(...userStatus),
        gender: Joi.string().valid("male", "female"),
        address: Joi.string(),
        birth_date: Joi.string().pattern(new RegExp(dateRegex)).messages({
          "string.pattern.base": `date format should be YYYY-MM-DD`,
        }),
        avatar: Joi.string().uri(),
      })
      .unknown(true),

    emailSchema: Joi.object()
      .keys({
        ...emailSchemaKey,
      })
      .unknown(true),

    EmailVerificationSchema: Joi.object()
      .keys({
        ...emailSchemaKey,
        otp: Joi.string()
          .regex(/^[0-9]/)
          .messages({ "string.pattern.base": `Invalid Otp` })
          .min(6)
          .max(6)
          .required(),
      })
      .unknown(true),

    loginSchema: Joi.object()
      .keys({
        ...emailSchemaKey,
        password: Joi.string()
          .pattern(new RegExp(passwordRegex))
          .messages({
            "string.pattern.base": `The password needs to be at least eight characters long and contain capital, lowercase, numbers, and special characters.`,
          })
          .required(),
      })
      .unknown(true),

    passwordResetSchema: Joi.object()
      .keys({
        ...emailSchemaKey,
        otp: Joi.string()
          .regex(/^[0-9]/)
          .messages({ "string.pattern.base": `Invalid Otp` })
          .min(6)
          .max(6)
          .required(),
        password: Joi.string()
          .pattern(new RegExp(passwordRegex))
          .messages({
            "string.pattern.base": `The password needs to be at least eight characters long and contain capital, lowercase, numbers, and special characters.`,
          })
          .required(),
      })
      .unknown(true),

    changePasswordSchema: Joi.object()
      .keys({
        oldPassword: Joi.string()
          .pattern(new RegExp(passwordRegex))
          .messages({
            "string.pattern.base": `The password must be at least eight characters long and contain capital, lowercase, numbers, and special characters.`,
          })
          .required(),
        password: Joi.string()
          .pattern(new RegExp(passwordRegex))
          .messages({
            "string.pattern.base": `The password needs to be at least eight characters long and contain capital, lowercase, numbers, and special characters.`,
          })
          .required(),
      })
      .unknown(true),
  },

  storySchemas: {
    addStorySchema: Joi.object()
      .keys({
        ...addStorySchemaKeys,
      })
      .unknown(true),

    storyListSchema: Joi.object()
      .keys({
        ...paginationValidation,
        category: Joi.string().custom(validateMongoId, "CategoryId validation"),
        listType: Joi.string().valid("admin", "user", "main").default("main"),
        status: Joi.string().when("listType", {
          is: Joi.alternatives().try("main"),
          then: Joi.valid("active"),
          otherwise: Joi.valid(...storyStatus),
        }),
      })
      .unknown(true),

    storyDetailsSchema: Joi.object()
      .keys({
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
      })
      .unknown(true),

    updateStorySchema: Joi.object()
      .keys({
        ...addStorySchemaKeys,
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
      })
      .unknown(true),

    reportStorySchema: Joi.object()
      .keys({
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
        reason: Joi.string()
          .valid(...storyReportReasons)
          .required(),
        description: Joi.string().min(15).max(500).required(),
      })
      .unknown(true),
  },

  storyResponseSchemas: {
    addStoryReactionSchema: Joi.object()
      .keys({
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
        reaction: Joi.string()
          .valid(...storyResponseTypes)
          .required(),
      })
      .unknown(true),
    storyReactionListSchema: Joi.object()
      .keys({
        ...paginationValidation,
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
      })
      .unknown(true),

    addStoryCommentSchema: Joi.object()
      .keys({
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
        comment: Joi.string().min(15).max(1200).required(),
      })
      .unknown(true),

    storyCommentsListSchema: Joi.object()
      .keys({
        ...paginationValidation,
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
      })
      .unknown(true),

    addCommentReplySchema: Joi.object()
      .keys({
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
        commentId: Joi.string().custom(validateMongoId, "commentId validation").required(),
        reply: Joi.string().min(10).max(850).required(),
      })
      .unknown(true),

    repliesListSchema: Joi.object()
      .keys({
        ...paginationValidation,
        commentId: Joi.string().custom(validateMongoId, "commentId validation").required(),
      })
      .unknown(true),

    commentReactionSchema: Joi.object()
      .keys({
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
        commentId: Joi.string().custom(validateMongoId, "commentId validation").required(),
        reaction: Joi.string().valid("like, dislike").required(),
      })
      .unknown(true),
  },

  querySchema: {
    addQuerySchema: Joi.object()
      .keys({
        ...emailSchemaKey,
        name: Joi.string()
          .min(3)
          .max(30)
          .pattern(/^[a-zA-Z0-9 ]+$/)
          .messages({
            "string.pattern.base": `Name can have only alphabets and numbers`,
          })
          .required(),
        mobile: Joi.string().custom(validateMobile, "Mobile  validation").required(),
        reason: Joi.string()
          .valid(...queryReasons)
          .required(),
        comment: Joi.string().min(10).max(500).required(),
        file: Joi.string().uri(),
      })
      .unknown(true),

    updateQuerySchema: Joi.object()
      .keys({
        queryId: Joi.string().custom(validateMongoId, "queryId validation").required(),
        reply: Joi.string().min(10).max(500).required(),
        status: Joi.string()
          .valid(...queryStatus)
          .default("active"),
      })
      .unknown(true),
  },

  bookmarkSchema: {
    manageBookmarkSchema: Joi.object()
      .keys({
        storyId: Joi.string().custom(validateMongoId, "storyId validation").required(),
      })
      .unknown(true),

    bookmarksListSchema: Joi.object()
      .keys({
        ...paginationValidation,
      })
      .unknown(true),
  },

  categorySchema: {
    addCategorySchema: Joi.object()
      .keys({
        ...addCategorySchemaKeys,
      })
      .unknown(true),
    updateCategorySchema: Joi.object()
      .keys({
        ...addCategorySchemaKeys,
        categoryId: Joi.string().custom(validateMongoId, "categoryId validation").required(),
      })
      .unknown(true),
    deleteCategorySchema: Joi.object()
      .keys({
        categoryId: Joi.string().custom(validateMongoId, "categoryId validation").required(),
      })
      .unknown(true),
  },

  validateRequest: (schema) => {
    return (req, res, next) => {
      try {
        const result = schema.validate(req.body, {
          stripUnknown: true,
        });

        if (result.error) {
          return ResponseService.failed(
            res,
            result.error?.details?.[0] || {},
            StatusCode.badRequest
          );
        } else {
          if (!req.value) {
            req.value = {};
          }

          req["body"] = result.value;
          next();
        }
      } catch (error) {
        return ResponseService.serverError(res, error);
      }
    };
  },
};
