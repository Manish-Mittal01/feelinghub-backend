const { StatusCode } = require("../utils/constants");
const { ResponseService } = require("../services/responseService");
const faqModel = require("../Models/faqModel");

module.exports.addFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const isFaqExist = await faqModel.findOne({ question });
    if (isFaqExist)
      return ResponseService.failed(res, "Question already exist", StatusCode.forbidden);

    const newPageContent = { question, answer };
    const pageContent = new faqModel(newPageContent);

    const result = await pageContent.save();

    return ResponseService.success(res, "FAQ added successfully", result);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};

module.exports.updateFaq = async (req, res) => {
  try {
    const { question, answer, faqId } = req.body;

    const isFaqExist = await faqModel.exists({ _id: faqId });
    if (!isFaqExist) return ResponseService.failed(res, "Faq not found", StatusCode.notFound);

    const result = await faqModel.updateOne({ _id: faqId }, { question, answer });

    return ResponseService.success(res, "Faq updated successfully", result);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};

module.exports.deleteFaq = async (req, res) => {
  try {
    const { faqId } = req.body;

    const isFaqExist = await faqModel.exists({ _id: faqId });
    if (!isFaqExist) return ResponseService.success(res, "Faq deleted successfully", {});

    const result = await faqModel.deleteOne({ _id: faqId });

    return ResponseService.success(res, "Faq deleted successfully", result);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};

module.exports.getFaqsList = async (req, res) => {
  try {
    const faqs = await faqModel.find().lean();

    return ResponseService.success(res, "Faqs list found successfully", faqs);
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};
