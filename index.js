require("dotenv/config");
const { connectDatabase } = require("./db/config");
const { handleSockets, server } = require("./sockets/connections");

const main = async () => {
  await connectDatabase().then((db) => {
    db.on("error", (err) => {
      console.error("Failed to connect to database", err);
      process.exit(1);
    });

    db.once("open", () => {
      console.info("Connected to database");
      const port = process.env.PORT || 5000;
      server.listen(port, () => {
        console.log(`App is running on ${port}`);
        handleSockets();
      });
    });
  });
};

main();
