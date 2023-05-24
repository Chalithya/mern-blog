const fs = require("fs");
const bcrypt = require("bcryptjs");

exports.fileHandler = (file) => {
  let profileImagePath = null;
  if (file) {
    const { originalname, path } = file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    profileImagePath = path + "." + ext;
    fs.renameSync(path, profileImagePath);
  }

  return profileImagePath;
};

exports.passwordEncrypter = (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};
