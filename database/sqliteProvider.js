const settings = require("../settings.json");
const Database = require("better-sqlite3");
const file = settings.custom.dbFile || settings.default.sqlite.dbFile;
const db = new Database("./" + file + ".sqlite");
const set = require("lodash.set");
const get = require("lodash.get");
const unset = require("lodash.unset");

/* Arbitrate */
module.exports.arbitrate = (method, params) => {
   let options = { table: `data` };
   db.prepare(`CREATE TABLE IF NOT EXISTS ${options.table} (ID TEXT, json TEXT)`).run();
   if (params.ops.target && params.ops.target[0] === ".") params.ops.target = params.ops.target.slice(1);
   if (params.data && params.data === Infinity) throw new TypeError(`${params.id}`);

   if (params.stringify) {
      try {
         params.data = JSON.stringify(params.data);
      } catch (e) {
         throw new TypeError(`${e.message}`);
      }
   }

   if (params.id && params.id.includes(".")) {
      let unparsed = params.id.split(".");
      params.id = unparsed.shift();
      params.ops.target = unparsed.join(".");
   }
   var methods = {
      set: this.set,
      fetch: this.fetch,
      has: this.has,
      delete: this.delete,
      add: this.add,
      subtract: this.subtract,
      dataAll: this.dataAll,
      dataAllDelete: this.dataAllDelete
   };
   return methods[method](db, params, options);
};

/* Set */
module.exports.set = (db, params, options) => {
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) {
      db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, "{}");
      fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   }
   fetched = JSON.parse(fetched.json);
   try {
      fetched = JSON.parse(fetched);
   } catch (e) {}
   if (typeof fetched === "object" && params.ops.target) {
      params.data = JSON.parse(params.data);
      params.data = set(fetched, params.ops.target, params.data);
   } else if (params.ops.target) throw new TypeError("Hata!");
   params.data = JSON.stringify(params.data);
   db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
   let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
   if (newData === "{}") return null;
   else {
      newData = JSON.parse(newData);
      try {
         newData = JSON.parse(newData);
      } catch (e) {}
      return newData;
   }
};
module.exports.delete = (db, params, options) => {
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) return "No data!";
   else fetched = JSON.parse(fetched.json);
   try {
      fetched = JSON.parse(fetched);
   } catch (e) {}
   if (typeof fetched === "object" && params.ops.target) {
      unset(fetched, params.ops.target);
      fetched = JSON.stringify(fetched);
      db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(fetched, params.id);
      return true;
   } else if (params.ops.target) throw new TypeError("ERROR!");
   else db.prepare(`DELETE FROM ${options.table} WHERE ID = (?)`).run(params.id);
   return true;
};

module.exports.add = (db, params, options) => {
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) {
      db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, "{}");
      fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   }
   if (params.ops.target) {
      fetched = JSON.parse(fetched.json);
      try {
         fetched = JSON.parse(fetched);
      } catch (e) {}
      params.data = JSON.parse(params.data);
      let oldValue = get(fetched, params.ops.target);
      if (oldValue === undefined) oldValue = 0;
      else if (isNaN(oldValue)) throw new Error(`Not the data number to be added!`);
      params.data = set(fetched, params.ops.target, oldValue + params.data);
   } else {
      if (fetched.json === "{}") fetched.json = 0;
      else fetched.json = JSON.parse(fetched.json);
      try {
         fetched.json = JSON.parse(fetched);
      } catch (e) {}
      if (isNaN(fetched.json)) throw new Error(`The data to be added is not a number!`);
      params.data = parseInt(fetched.json, 10) + parseInt(params.data, 10);
   }
   params.data = JSON.stringify(params.data);
   db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
   let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
   if (newData === "{}") return null;
   else {
      newData = JSON.parse(newData);
      try {
         newData = JSON.parse(newData);
      } catch (e) {}
      return newData;
   }
};
module.exports.subtract = (db, params, options) => {
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) {
      db.prepare(`INSERT INTO ${options.table} (ID,json) VALUES (?,?)`).run(params.id, "{}");
      fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   }
   if (params.ops.target) {
      fetched = JSON.parse(fetched.json);
      try {
         fetched = JSON.parse(fetched);
      } catch (e) {}
      params.data = JSON.parse(params.data);
      let oldValue = get(fetched, params.ops.target);
      if (oldValue === undefined) oldValue = 0;
      else if (isNaN(oldValue)) throw new Error("Target is not a number.");
      params.data = set(fetched, params.ops.target, oldValue - params.data);
   } else {
      if (fetched.json === "{}") fetched.json = 0;
      else fetched.json = JSON.parse(fetched.json);
      try {
         fetched.json = JSON.parse(fetched);
      } catch (e) {}
      if (isNaN(fetched.json)) throw new Error("Target is not a number.");
      params.data = parseInt(fetched.json, 10) - parseInt(params.data, 10);
   }
   params.data = JSON.stringify(params.data);
   db.prepare(`UPDATE ${options.table} SET json = (?) WHERE ID = (?)`).run(params.data, params.id);
   let newData = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id).json;
   if (newData === "{}") return null;
   else {
      newData = JSON.parse(newData);
      try {
         newData = JSON.parse(newData);
      } catch (e) {}
      return newData;
   }
};

module.exports.dataAll = (db, options) => {
   var stmt = db.prepare(`SELECT * FROM data WHERE ID IS NOT NULL`);
   let resp = [];
   for (var row of stmt.iterate()) {
      try {
         resp.push({
            ID: row.ID,
            data: JSON.parse(row.json)
         });
      } catch (e) {}
   }

   return resp;
};

module.exports.dataAllDelete = (options) => {
   let data = db.prepare(`DELETE FROM data`).run();
   if (!data) return null;
   return "Success";
};

module.exports.fetch = (db, params, options) => {
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) return "No data!";
   fetched = JSON.parse(fetched.json);
   try {
      fetched = JSON.parse(fetched);
   } catch (e) {}
   if (params.ops.target) fetched = get(fetched, params.ops.target);
   return fetched;
};

module.exports.has = (db, params, options) => {
   let fetched = db.prepare(`SELECT * FROM ${options.table} WHERE ID = (?)`).get(params.id);
   if (!fetched) return `false`;
   if (!fetched) return false;
   else fetched = JSON.parse(fetched.json);
   try {
      fetched = JSON.parse(fetched);
   } catch (e) {}
   if (params.ops.target) fetched = get(fetched, params.ops.target);

   fetched ? true : false;
   return fetched ? `true` : `false`;
};
