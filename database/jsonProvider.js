const settings = require("../settings.json");
const low = require("lowdb");
const lw = require("lowdb/adapters/FileSync");
const fs = require("fs");

const language = require("../config/" + settings.custom.dbLang || "en" + ".js");

if (settings.custom.dbType == "json") {
   this.db = low(new lw(settings.custom.dbFile + ".json" || settings.default.json.dbFile + ".json"));
   this.db.defaults({}).write();
}

/* Set */
module.exports.set = (name, desc) => {
   try {
      this.db.set(name, desc).write();
      return this.db.get(name).value();
   } catch (err) {
      console.log(err);
      throw new Error(language.error);
   }
};
/* Has */
module.exports.has = (file) => {
   try {
      return this.db.has(file).value() ? true : false;
   } catch (err) {
      throw new Error(language.error);
   }
};
/* Fetch */
module.exports.fetch = (file) => {
   try {
      return this.db.has(file) ? this.db.get(file).value() : undefined;
   } catch (err) {
      throw new Error(language.error);
   }
};
/* Delete */
module.exports.delete = (file) => {
   try {
      this.db.unset(file).write();
      return true;
   } catch (err) {
      throw new Error(language.error);
   }
};
/* Add */
module.exports.add = (name, number) => {
   try {
      if (this.db.has(name).value() === false) return null;
      if (typeof this.db.get(name).value() !== "number") throw new TypeError("I cannot perform operations because the data name you specified is not a number.");
      this.db.set(name, Math.floor(this.db.get(name).value() + number)).write();
      return this.db.get(name).value();
   } catch (err) {
      throw new Error(language.error);
   }
};
/* Subtract */
module.exports.subtract = (name, number) => {
   try {
      if (this.db.has(name).value() === false) return null;
      if (typeof this.db.get(name).value() !== "number") throw new TypeError("I cannot perform operations because the data name you specified is not a number.");
      this.db.set(name, Math.floor(this.db.get(name).value() - number)).write();
      return this.db.get(name).value();
   } catch (err) {
      throw new Error("I cannot perform operations because the data name you specified is not a number.");
   }
};
/* Data All */
module.exports.dataAll = () => {
   try {
      return this.db.value();
   } catch (err) {
      throw new Error(language.error);
   }
};

module.exports.dataAllDelete = () => {
   try {
      fs.writeFile(settings.custom.dbFile || settings.default.json.dbFile, "{}", function (err, data) {
         if (err) throw new Error();
      });
      return true;
   } catch (err) {
      throw new Error(language.error);
   }
};
