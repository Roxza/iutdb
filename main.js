const jsonDB = require("./database/jsonProvider");
const sqliteDB = require("./database/sqliteProvider");
const settingsConfig = require("./settings.json");

class iutdb {
   constructor(settings) {
      this.dbFile = settings["dbFile"].toLowerCase();
      this.dbLang = settings["dbLang"].toLowerCase();
      this.dbType = settings["dbType"].toLowerCase();

      /* Language */
      const langs = ["tr", "en"];
      if (!langs.includes(this.dbLang)) throw new TypeError("Please select a valid language; 'EN','TR'");
      if (!this.dbLang) throw new Error("Please use properly for more information https://www.npmjs.com/package/iutdb");
      const language = require("./config/" + this.dbLang + ".js");
      /* Database File Check*/
      if (!this.dbFile) throw new Error(language.file_not_found);
      /* Database Type Check */
      const types = ["sqlite", "json"];
      if (!types.includes(this.dbType)) throw new TypeError(language.types);
      if (!this.dbType) throw new Error(language.type_not_found);

      /* Set */
      const low = require("lowdb");
      const lw = require("lowdb/adapters/FileSync");
      this.settingsDB = low(new lw("./settings.json"));
      this.settingsDB
         .defaults({
            custom: {
               dbType: "json",
               dbFile: "data",
               dbLang: "en"
            },
            default: {
               default: {
                  dbType: "json",
                  dbFile: "data",
                  dbLang: "en"
               }
            }
         })
         .write();
      this.settingsDB
         .set("custom", {
            dbType: this.dbType || settingsConfig.default.default.dbType,
            dbFile: this.dbFile || settingsConfig.default.default.dbFile,
            dbLang: this.dbLang || settingsConfig.default.default.dbLang
         })
         .write();

      /* Constructors */
      this.set = this.constructor.set;
      this.delete = this.constructor.delete;
      this.fetch = this.constructor.fetch;
      this.has = this.constructor.has;
      this.add = this.constructor.add;
      this.subtract = this.constructor.subtract;
      this.dataAll = this.constructor.dataAll;
      this.dataAllDelete = this.constructor.dataAllDelete;
   }
   static set(name, desc, ops) {
      if (this.dbType === "json") {
         if (!name) throw new Error();
         if (!desc) throw new Error();
         return jsonDB.set(name, desc);
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("set", {
            id: name,
            data: desc,
            ops: ops || {}
         });
      }
   }
   static fetch(file, ops) {
      if (this.dbType === "json") {
         if (!file) throw new Error();
         return jsonDB.fetch(file);
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("fetch", { id: file, ops: ops || {} });
      }
   }
   static has(file, ops) {
      if (this.dbType === "json") {
         if (!file) throw new Error();
         return jsonDB.has(file);
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("has", { id: file, ops: ops || {} });
      }
   }

   static delete(file, ops) {
      if (this.dbType === "json") {
         if (!file) throw new Error();
         return jsonDB.delete(file);
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("delete", { id: file, ops: ops || {} });
      }
   }
   static subtract(name, number, ops) {
      if (this.dbType === "json") {
         return jsonDB.subtract(name, number);
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("subtract", {
            id: name,
            data: number,
            ops: ops || {}
         });
      }
   }
   static add(name, number, ops) {
      if (typeof number !== "number") throw new TypeError("I cannot perform operations because the data name you specified is not a number.");
      if (this.dbType === "json") {
         return jsonDB.add(name, number);
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("add", {
            id: name,
            data: number,
            ops: ops || {}
         });
      }
   }
   static dataAll(ops) {
      if (this.dbType === "json") {
         return jsonDB.dataAll();
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("dataAll", { ops: ops || {} });
      }
   }
   static dataAllDelete(ops) {
      if (this.dbType === "json") {
         return jsonDB.dataAllDelete();
      } else if (this.dbType === "sqlite") {
         return sqliteDB.arbitrate("dataAllDelete", { ops: ops || {} });
      }
   }
   static developer() {
      return "Roxza#0002 (Discord)";
   }
}

module.exports = iutdb;
