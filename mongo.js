import { connect } from "mongoose";
function dbConnection() {
  connect(
    "mongodb://0.0.0.0:27017/logger_db",
    // { useNewUrlParser: true, useUnifiedTopology: true },
    (error) => {
      if (!error) {
        console.log("connected to the mongoDB");
      } else {
        console.log("connection to mongoDB failed \n" + error);
        setTimeout(dbConnection, 5000);
      }
    }
  );
}

export { dbConnection };