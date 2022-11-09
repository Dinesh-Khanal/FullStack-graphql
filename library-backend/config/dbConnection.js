const mongoose = require("mongoose");

const connectDb = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((data) =>
      console.log(`Database connected to ${data.connection.host}`)
    )
    .catch((error) => console.log(error.message));
};

module.exports = connectDb;
