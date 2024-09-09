const router = require("express").Router();
const { authCheck } = require("../middlewares/authCheck");
const {
  validateRequest,
  storySchemas,
  storyResponseSchemas,
  querySchema,
  bookmarkSchema,
  commonSchema,
} = require("../middlewares/validateRequest");
const storyResponseController = require("../userControllers/storyResponseController");
const storyController = require("../userControllers/storyController");
const { addQuery, updateQuery } = require("../userControllers/queryController");
const { manageBookmark, getBookmarkList } = require("../userControllers/bookmarkController");

// stories
router
  .route("/stories/list")
  .post(validateRequest(storySchemas.storyListSchema), storyController.getStoriesList);
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

// query
router.route("/query/add").post(validateRequest(querySchema.addQuerySchema), addQuery);
router.route("/query/update").post(validateRequest(querySchema.updateQuerySchema), updateQuery);

// bookmark
router
  .route("/bookmark/manage")
  .post(authCheck, validateRequest(bookmarkSchema.manageBookmarkSchema), manageBookmark);
router
  .route("/bookmarks/list")
  .post(authCheck, validateRequest(bookmarkSchema.bookmarksListSchema), getBookmarkList);

module.exports = router;
