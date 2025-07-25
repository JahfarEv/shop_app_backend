const express = require('express');
const {
  registerSalesman,
  loginSalesman, 
  getSalesmanById
} = require('../controller/Salesman.controller'); // adjust path if needed

const {verifyManager,verifySalesman,verifyToken} = require("../middleware/verifyToken");

const router = express.Router();

// ✅ Base: /api/salesman
router.post('/register', registerSalesman);
router.post('/login', loginSalesman);
router.get('/details/:id', getSalesmanById)
router.get('/test-token',verifyToken,verifySalesman, (req,res)=>{

  res.send("test pass");
})
module.exports = router;
