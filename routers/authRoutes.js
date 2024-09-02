const router = require("express").Router();
const authController = require("../auth/authController");
const { authCheck } = require("../middlewares/authCheck");
const { validateRequest, authSchemas } = require("../middlewares/validateRequest");

router
  .route("/register")
  .post(validateRequest(authSchemas.registrationSchema), authController.register);
router.route("/resendOtp").post(validateRequest(authSchemas.emailSchema), authController.resendOtp);
router
  .route("/verifyEmail")
  .post(validateRequest(authSchemas.EmailVerificationSchema), authController.verifyEmail);
router.route("/login").post(validateRequest(authSchemas.loginSchema), authController.login);
router.route("/sendOtp").post(validateRequest(authSchemas.emailSchema), authController.sendOtp);
router
  .route("/resetPassword")
  .post(validateRequest(authSchemas.passwordResetSchema), authController.resetPassword);
router.route("/getUserProfile").get(authCheck, authController.getUserProfile);
router
  .route("/updateProfile")
  .post(
    authCheck,
    validateRequest(authSchemas.registrationSchema),
    authController.updateUserProfile
  );
router
  .route("/changePassword")
  .post(
    authCheck,
    validateRequest(authSchemas.changePasswordSchema),
    authController.changePassword
  );
router.route("/logout").get(authCheck, authController.logout);

module.exports = router;
