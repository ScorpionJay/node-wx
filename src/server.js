/**
 * @description server
 * @since 2018-01-18
 * @author jay
 */

require("babel-polyfill");

require("babel-register")({
  presets: [
    [
      "env",
      {
        targets: {
          node: "current"
        }
      }
    ]
  ],
  plugins: ["add-module-exports"]
});

const app = require("./app.js");

const port = 18080;
app.listen(port, "0.0.0.0", () => {
  console.log(" server started, bind port %d", port);
});
