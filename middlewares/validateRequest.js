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
  userReportReasons,
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
  category: Joi.string().custom(validateMongoId, "CategoryId validation").required(),
  anonymousSharing: Joi.boolean(),
  isPrivate: Joi.boolean(),
  status: Joi.string()
    .valid(...storyStatus)
    .default("active"),
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
        // gender: Joi.string().valid("male", "female"),
        // address: Joi.string(),
        // birth_date: Joi.string().pattern(new RegExp(dateRegex)).messages({
        //   "string.pattern.base": `date format should be YYYY-MM-DD`,
        // }),
        avatar: Joi.alternatives().try(
          Joi.object({
            url: Joi.string().uri().required(),
            name: Joi.string().required(),
          }),
          Joi.string().allow("")
        ),
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
        loginType: Joi.string().valid("google", "normal").required(),
      })
      .when(Joi.object({ loginType: Joi.string().valid("google") }).unknown(), {
        then: Joi.object({
          token: Joi.string().required(),
        }),
        otherwise: Joi.object({
          ...emailSchemaKey,
          password: Joi.string()
            .pattern(new RegExp(passwordRegex))
            .messages({
              "string.pattern.base": `The password needs to be at least eight characters long and contain capital, lowercase, numbers, and special characters.`,
            })
            .required(),
        }),
      }),

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

    updateProfileSchema: Joi.object()
      .keys({
        name: Joi.string()
          .pattern(/^[a-zA-Z0-9 ]+$/)
          .messages({
            "string.pattern.base": `Name can have only alphabets and numbers`,
          })
          .min(3)
          .max(30)
          .required(),
        mobile: Joi.string().required().custom(validateMobile, "Mobile validation").required(),
        status: Joi.string().valid(...userStatus),
        gender: Joi.string().valid("male", "female").required(),
        address: Joi.string().required(),
        birth_date: Joi.string()
          .pattern(new RegExp(dateRegex))
          .messages({
            "string.pattern.base": `date format should be YYYY-MM-DD`,
          })
          .required(),
        avatar: Joi.alternatives().try(
          Joi.object({
            url: Joi.string().uri().required(),
            name: Joi.string().required(),
          }),
          Joi.string().allow("")
        ),
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
        user: Joi.string().custom(validateMongoId, "userId validation"),
        listType: Joi.string().valid("admin", "user", "main", "others").default("main"),
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
        commentId: Joi.string().custom(validateMongoId, "commentId validation").required(),
        reaction: Joi.string().valid("like", "dislike").required(),
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

    queriesListSchema: Joi.object()
      .keys({
        ...paginationValidation,
        reason: Joi.string()
          .valid(...queryReasons)
          .allow(""),
        status: Joi.string().valid(...queryStatus),
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

  otherUserProfileSchema: {
    getOtherUserProfile: Joi.object()
      .keys({
        ...paginationValidation,
        otherUserId: Joi.string().custom(validateMongoId, "storyId validation").required(),
      })
      .unknown(true),
    reportUser: Joi.object().keys({
      otherUserId: Joi.string().custom(validateMongoId, "storyId validation").required(),
      reason: Joi.string()
        .valid(...userReportReasons)
        .required(),
      description: Joi.string().min(15).max(500).required(),
    }),
  },

  //////////// utility
  firebaseSchema: {
    updateTokenSchema: Joi.object()
      .keys({
        firebaseToken: Joi.string().required(),
      })
      .unknown(true),
  },
  cmsSchema: {
    addCmsSchema: Joi.object()
      .keys({
        title: Joi.string().min(3).max(30).required(),
        content: Joi.string().min(100).max(5000).required(),
      })
      .unknown(true),
    updateCmsSchema: Joi.object()
      .keys({
        pageId: Joi.string().custom(validateMongoId, "cmsPageId").required(),
        title: Joi.string().min(3).max(30).required(),
        content: Joi.string().min(100).max(5000).required(),
      })
      .unknown(true),
    deleteCmsSchema: Joi.object()
      .keys({
        pageId: Joi.string().custom(validateMongoId, "cmsPageId").required(),
      })
      .unknown(true),
  },
  faqSchema: {
    addFaqSchema: Joi.object()
      .keys({
        question: Joi.string().min(3).max(50).required(),
        answer: Joi.string().min(50).max(2000).required(),
      })
      .unknown(true),
    updateFaqSchema: Joi.object()
      .keys({
        faqId: Joi.string().custom(validateMongoId, "faqId").required(),
        question: Joi.string().min(3).max(50).required(),
        answer: Joi.string().min(50).max(2000).required(),
      })
      .unknown(true),
    deleteFaqSchema: Joi.object()
      .keys({
        faqId: Joi.string().custom(validateMongoId, "faqId").required(),
      })
      .unknown(true),
  },

  ////////////admin
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
  usersSchema: {
    usersListSchema: Joi.object()
      .keys({
        ...paginationValidation,
      })
      .unknown(true),
    updateUserStatusSchema: Joi.object()
      .keys({
        otherUserId: Joi.string().custom(validateMongoId, "userId validation").required(),
        status: Joi.string().valid("active", "blocked").required(),
      })
      .unknown(true),
    userReportsList: Joi.object()
      .keys({
        ...paginationValidation,
        otherUserId: Joi.string().custom(validateMongoId, "userId validation").required(),
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

  validateRequestParams: (schema) => {
    return (req, res, next) => {
      try {
        const result = schema.validate(req.params, {
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
