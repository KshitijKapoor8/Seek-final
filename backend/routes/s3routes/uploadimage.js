const multerS3 = require("multer-s3-v2");
const multer = require("multer");
const router = require("express").Router();
const path = require("path");
const aws = require("aws-sdk");

const IAM_USER_KEY = "";
const IAM_USER_SECRET = "";

const s3 = new aws.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET,
  bucket: "empathimages2",
  region: "us-east-2",
});

// Single images upload
const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "empathimages2",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 20000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

router.post("/img-upload", (req, res) => {
  imageUpload(req, res, (error) => {
    if (error) {
      console.log(error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.file === undefined) {
        res.json("Error: No File Selected");
      } else {
        // If Success
        const imageName = req.file.originalname;
        const imageLocation = req.file.location;
        // Handle the uploaded image information as needed
        res.json({ imageName: imageName, imageLocation: imageLocation });
      }
    }
  });
});

router.post("/img-delete/", (req, res) => {
  let x = req.body.id;

  var params = {
    Bucket: "empathimages2",
    Key: x,
  };

  s3.deleteObject(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
});

module.exports = router;
