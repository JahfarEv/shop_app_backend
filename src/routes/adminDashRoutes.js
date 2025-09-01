const express = require("express");
const router = express.Router();
const {handleGetAllUsers,handleGetUserById,handleUpdateUser,deleteUserController,getUserLocation,updateUserLocation,getUserDetailsController,AdminsearchUserController} = require("../controller/user.controller");
const shopController = require("../controller/shop.Controller");
const {handleCreateProduct,handleGetAllProducts,handleGetProductById,handleUpdateProductById,handleDeleteProductById,getProductsByUserId,getProductsByShopId,getNearbyProductsController,searchProducts } = require("../controller/product.controller");
const {createPlan,getAllPlans,getPlanById,updatePlan,deletePlan,} = require("../controller/SubscriptionPlanController");
const {handleStartSubscription,handleCheckSubscriptionStatus,handleGetAllSubscriptions,handleSubscriptionByUser} = require("../controller/subscription.controller");
const { assignAgentCodeToSalesman } = require('../controller/adminAuth.controller');
const { verifyToken,verifyAdmin } = require("../middleware/verifyToken");
const { approveManager, approveSalesman } = require('../controller/adminAuth.controller');
const {setSalesmanCommission} = require("../controller/adminAuth.controller");
const {setManagerCommission} = require("../controller/adminAuth.controller");
const {getSalesmanCommission} = require("../controller/adminAuth.controller");
const {getManagerCommission} = require("../controller/adminAuth.controller");
const {handleCreateAdvertisement} = require("../controller/adminAuth.controller");
const {handleGetAdvertisements} = require("../controller/adminAuth.controller");
const {unapprovedSalesmen} = require("../controller/adminAuth.controller")
const {getAllMarketingManagers} = require("../controller/adminAuth.controller")
const {getAllSalesman} = require('../controller/adminAuth.controller')
const upload = require("../middleware/multer");

// users api route of admin pannel -

// only need admin "token" to access this route
// need both token middleware in this to make this route work
router.get("/getalluser",verifyToken,verifyAdmin,handleGetAllUsers);
router.get("/search-users/:keyword",verifyToken,verifyAdmin,AdminsearchUserController);
router.delete("/deleteuser/:id",verifyToken,verifyAdmin,deleteUserController);

// shops api route of admin pannel -
// only need admin "token" to access this route
// need both token middleware in this to make this route work
router.get("/getallshops",verifyToken,verifyAdmin,shopController.AdminGetAllShops);
router.get("/search-shop/:keyword",verifyToken,verifyAdmin, shopController.AdminsearchShopController);
router.put('/change-shop-ban-status/:shopId',verifyToken,verifyAdmin, shopController.AdminChangeShopBanStatus);
router.delete("/delete-shopById/:id",verifyToken,verifyAdmin, shopController.deleteShop); // Delete shop by ID


// product api route of admin pannel -
router.get("/get-product-by-shopId/:shopId",verifyToken,verifyAdmin, getProductsByShopId);
router.delete("/delete-product/:id",verifyToken,verifyAdmin, handleDeleteProductById);


//subscription details in admin pannel-
// only need admin "token" to access this route
// need both token middleware in this to make this route work
router.get("/getallsubscription",verifyToken,verifyAdmin , handleGetAllSubscriptions);
router.get("/subscription/byuserid/:userId",verifyToken,verifyAdmin,handleSubscriptionByUser);

//subscription plans admin pannel - 
router.post("/createplan",verifyToken,verifyAdmin, createPlan);
router.get("/getallplan",verifyToken,verifyAdmin, getAllPlans);
router.get("/getplanbyid/:id",verifyToken,verifyAdmin, getPlanById);
router.put("/updateplan/:id",verifyToken,verifyAdmin, updatePlan);
router.delete("/deleteplan/:id",verifyToken,verifyAdmin, deletePlan);


// PATCH adminDashboard/salesman/:id/agent-code
router.patch('/salesman/:id/agent-code',  assignAgentCodeToSalesman);
// verifyToken, verifyAdmin,

// PATCH /adminDashboard/approve/manager/:managerId
router.patch('/approve/manager/:managerId', approveManager);

// PATCH /adminDashboard/approve/salesman/:salesmanId
router.patch('/approve/salesman/:salesmanId', approveSalesman);

router.get('/managers', getAllMarketingManagers)
router.get('/salesman', getAllSalesman)


router.put('/commission/salesman', setSalesmanCommission);
router.put('/commission/manager', setManagerCommission);
router.get('/get-commission/salesman',getSalesmanCommission);
router.get('/get-commission/manager', getManagerCommission)
router.post('/advertisement', upload.single("image"), handleCreateAdvertisement)
router.get('/advertisement',handleGetAdvertisements )
router.get('/get-salesman', unapprovedSalesmen)




module.exports = router;