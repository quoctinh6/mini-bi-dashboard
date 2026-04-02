const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadData } = require('../controllers/uploadController');
const { simulateApiSync } = require('../controllers/integrationController');

// Cấu hình Multer để lưu file tạm vào thư mục uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Lọc file chỉ cho phép excel, csv
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv' // csv
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Route POST: /api/data/upload
router.post('/upload', upload.single('file'), uploadData);
router.post('/sync', simulateApiSync);

module.exports = router;
