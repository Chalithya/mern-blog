exports.userNamePasswordValidator = (username, password) => {
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
};

//******************************Trying to validate credentials using a helper function // Not completed *******************************
// exports.validateCredentials = async (username, password) => {
//   if (!username || !password) {
//     throw new Error("Username and password are required");
//   }

//   const userDoc = await User.findOne({ username });
//   if (!userDoc) {
//     throw new Error("Invalid credentials");
//   }

//   const passwordMatch = await bcrypt.compare(password, userDoc.password);
//   if (!passwordMatch) {
//     throw new Error("Invalid credentials");
//   }

//   return userDoc;
// }
