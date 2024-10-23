const contentPagesModel = require("../Models/contentPagesModel");
const { StatusCode } = require("../utils/constants");
const { ResponseService } = require("../services/responseService");

module.exports.addContentPage = async (req, res) => {
  try {
    const { title, content } = req.body;

    const isPageExist = await contentPagesModel.findOne({ title });
    if (isPageExist)
      return ResponseService.failed(res, "Page already exist", StatusCode.badRequest);

    const newPageContent = { title, content };
    const pageContent = new contentPagesModel(newPageContent);

    const result = await pageContent.save();

    return ResponseService.success(res, "Page added successfully", result);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};

module.exports.updateContentPage = async (req, res) => {
  try {
    const { title, content, pageId } = req.body;

    const isPageExist = await contentPagesModel.exists({ _id: pageId });
    if (!isPageExist) return ResponseService.failed(res, "Page not found", StatusCode.notFound);

    const result = await contentPagesModel.updateOne({ _id: pageId }, { title, content });

    return ResponseService.success(res, "Page updated successfully", result);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};

module.exports.deleteContentPage = async (req, res) => {
  try {
    const { pageId } = req.body;

    const isPageExist = await contentPagesModel.exists({ _id: pageId });
    if (!isPageExist) return ResponseService.success(res, "Page deleted successfully", {});

    const result = await contentPagesModel.deleteOne({ _id: pageId });

    return ResponseService.success(res, "Page deleted successfully", result);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};

module.exports.getContentPageList = async (req, res) => {
  try {
    const contentPages = await contentPagesModel.find({}, "title").lean();

    return ResponseService.success(res, "Page list found successfully", contentPages);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};

module.exports.getPageContent = async (req, res) => {
  try {
    const { pageId } = req.body;

    const pageContent = await contentPagesModel.findOne({ _id: pageId });
    if (!pageContent) return ResponseService.success(res, "Page not found!!", StatusCode.notFound);

    return ResponseService.success(res, "Page found successfully", pageContent);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};
