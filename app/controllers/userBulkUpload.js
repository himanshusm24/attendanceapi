const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const CsvParser = require("json2csv").Parser;
const csv = require("csv-parser");
const path = require("path");
const db = require("../model/db");

function uploadDataFromCSV(filePath, branchId) {
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const data = {
        branch_id: branchId,
        name: row.name,
        email: row.email,
        contact: row.contact,
        password: row.password,
        gender: row.gender,
        designation: row.designation,
        paid_leave: row.paid_leave,
        aadhar_no: row.aadhar_no,
        pan_no: row.pan_no,
      };
      db.query("INSERT INTO users SET ?", data, (error, results, fields) => {
        if (error) {
          console.error(error);
        }
        console.log("Inserted row:", results);
      });
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
}

exports.BulkUploadUser = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { branchId } = req.body;

  const filePath = req.file.path;

  uploadDataFromCSV(filePath, branchId);
  res.send("File uploaded successfully.");
};

exports.sampleCSV = async (req, res) => {
  const j = {
    name: "",
    email: "",
    contact: "",
    password: "",
    gender: "",
    designation: "",
    paid_leave: "",
    aadhar_no: "",
    pan_no: "",
  };

  const fields = Object.keys(j);
  const opts = { fields };

  try {
    const parser = new CsvParser(opts);
    const csv = parser.parse([j]);

    // Write CSV to file
    const fileName = "SampleCSV.csv";
    const filePath = path.resolve("uploads", fileName);
    fs.writeFileSync(filePath, csv);

    // Send file as attachment
    res.setHeader("Content-Type", "text/csv");
    res.download(filePath, fileName);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
