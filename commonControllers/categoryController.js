const { ResponseService } = require("../services/responseService");
const { storyCategories } = require("../utils/constants");

module.exports.getCategory = async (req, res) => {
  try {
    return ResponseService.success(res, "Categories found!!", {
      items: storyCategories,
      totalCount: storyCategories.length || 0,
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.serverError(res, error);
  }
};

// module.exports.addToWishlist = async (req, res) => {
//   try {
//     const { id } = req.body;
//     const token = req.headers["x-access-token"];

//     const isTokenValid = await UserServices.validateToken(token);
//     // console.log("isTokenValid", isTokenValid);
//     if (isTokenValid?.tokenExpired || !isTokenValid._id)
//       return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

//     const validationError = checkRequiredFields({ id });
//     if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

//     const isVehicleExist = await wishlistmodel.findOne({ vehicle: id, user: isTokenValid._id });
//     if (isVehicleExist)
//       return ResponseService.failed(res, "Vehicle already exist", StatusCode.forbidden);

//     // const wishlistCount = await wishlistmodel.countDocuments({ user: isTokenValid._id });
//     // if (wishList >= 21) {
//     //   return ResponseService.failed(
//     //     res,
//     //     "You can only add up to 20 items in the list",
//     //     StatusCode.forbidden
//     //   );
//     // }

//     const newVehicle = { vehicle: id, user: isTokenValid._id };
//     const addedVehicle = new wishlistmodel(newVehicle);
//     const result = await addedVehicle.save();

//     return ResponseService.success(res, `vehicle added successfully`, result);
//   } catch (error) {
//     console.log("api error", error);
//     return ResponseService.failed(res, error, 400);
//   }
// };

// module.exports.removewishlistItem = async (req, res) => {
//   try {
//     const { id } = req.body;
//     const token = req.headers["x-access-token"];

//     const isTokenValid = await UserServices.validateToken(token);
//     // console.log("isTokenValid", isTokenValid);
//     if (isTokenValid?.tokenExpired || !isTokenValid._id)
//       return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

//     if (!id) return ResponseService.failed(res, "Id is required", StatusCode.badRequest);

//     const isVehicleExist = await wishlistmodel.findOne({ _id: id });

//     if (!isVehicleExist)
//       return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

//     const result = await wishlistmodel.deleteOne({
//       _id: id,
//     });

//     return ResponseService.success(res, "Vehicle removed from wishlist", result);
//   } catch (error) {
//     console.log("error", error);
//     return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
//   }
// };
