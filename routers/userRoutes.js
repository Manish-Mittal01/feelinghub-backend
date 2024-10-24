const router = require("express").Router();
const { authCheck } = require("../middlewares/authCheck");
const {
  validateRequest,
  storySchemas,
  storyResponseSchemas,
  querySchema,
  bookmarkSchema,
  commonSchema,
  profileSchema,
  cmsSchema,
} = require("../middlewares/validateRequest");
const storyResponseController = require("../userControllers/storyResponseController");
const storyController = require("../userControllers/storyController");
const cmsController = require("../adminControllers/contentPagesController");
const { addQuery, updateQuery, queriesList } = require("../userControllers/queryController");
const { manageBookmark, getBookmarkList } = require("../userControllers/bookmarkController");
const { getOtherUserProfile } = require("../userControllers/otherUserProfileCOntroller");
const { ResponseService } = require("../services/responseService");
const { getFaqsList } = require("../adminControllers/faqController");

const checkStoriesRequestType = async (req, res, next) => {
  try {
    const { listType } = req.body;
    if (listType === "user" || listType === "admin") {
      await authCheck(req, res, next);
    } else {
      next();
    }
  } catch (err) {
    return ResponseService.serverError(res, err);
  }
};

// stories
router
  .route("/stories/list")
  .post(
    checkStoriesRequestType,
    validateRequest(storySchemas.storyListSchema),
    storyController.getStoriesList
  );
router
  .route("/story/add")
  .post(authCheck, validateRequest(storySchemas.addStorySchema), storyController.addStory);
router
  .route("/story/details")
  .post(validateRequest(storySchemas.storyDetailsSchema), storyController.getStoryDetails);
router
  .route("/story/update")
  .post(validateRequest(storySchemas.updateStorySchema), storyController.updateStory);
router
  .route("/story/delete")
  .post(validateRequest(storySchemas.storyDetailsSchema), storyController.deleteStory);
router
  .route("/story/report")
  .post(authCheck, validateRequest(storySchemas.reportStorySchema), storyController.reportStory);

//story response
router
  .route("/story/reaction/add")
  .post(
    authCheck,
    validateRequest(storyResponseSchemas.addStoryReactionSchema),
    storyResponseController.manageStoryReaction
  );
router
  .route("/story/reaction/list")
  .post(
    validateRequest(storyResponseSchemas.storyReactionListSchema),
    storyResponseController.getReactionsList
  );
router
  .route("/story/comment/add")
  .post(
    authCheck,
    validateRequest(storyResponseSchemas.addStoryCommentSchema),
    storyResponseController.addStoryComment
  );
router
  .route("/story/comments/list")
  .post(
    validateRequest(storyResponseSchemas.storyCommentsListSchema),
    storyResponseController.getCommentsList
  );
router
  .route("/story/comment/reply/add")
  .post(
    authCheck,
    validateRequest(storyResponseSchemas.addCommentReplySchema),
    storyResponseController.addCommentReply
  );
router
  .route("/story/comment/replies/list")
  .post(
    validateRequest(storyResponseSchemas.repliesListSchema),
    storyResponseController.getRepliesList
  );
router
  .route("/story/comment/reaction/add")
  .post(
    authCheck,
    validateRequest(storyResponseSchemas.commentReactionSchema),
    storyResponseController.manageCommentReaction
  );
router
  .route("/story/usercomments/list")
  .post(
    authCheck,
    validateRequest(commonSchema.paginationSchema),
    storyResponseController.getUserCommentsAndRepliesList
  );

//profile
router
  .route("/profile/others")
  .post(validateRequest(profileSchema.getOtherUserProfile), getOtherUserProfile);

// query
router.route("/query/add").post(validateRequest(querySchema.addQuerySchema), addQuery);
router.route("/query/update").post(validateRequest(querySchema.updateQuerySchema), updateQuery);
router
  .route("/queries/list")
  .post(authCheck, validateRequest(querySchema.queriesListSchema), queriesList);

// bookmark
router
  .route("/bookmark/manage")
  .post(authCheck, validateRequest(bookmarkSchema.manageBookmarkSchema), manageBookmark);
router
  .route("/bookmarks/list")
  .post(authCheck, validateRequest(bookmarkSchema.bookmarksListSchema), getBookmarkList);

//cms management
router.route("/cms/page/list").get(cmsController.getContentPageList);
router
  .route("/cms/page/content")
  .post(validateRequest(cmsSchema.deleteCmsSchema), cmsController.getPageContent);

//faqs management
router.route("/faqs/list").get(getFaqsList);

module.exports = router;
