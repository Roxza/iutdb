[![NPM](https://img.shields.io/npm/v/iutdb.svg?maxAge=3600)](https://npmjs.com/package/iutdb/)
[![NPM](https://img.shields.io/npm/dt/iutdb.svg?maxAge=3600)](https://npmjs.com/package/iutdb/)
[![NPM](https://nodei.co/npm/iutdb.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.com/package/iutdb/)

# iut.db
⚡An easy, open source database (iut.db) 

# Examples

```js
const iutdb = require("iutdb");

const db = new iutdb({
   dbFile: "data", // Database file name
   dbLang: "EN", // Database lang (en,tr)
   dbType: "json" // Database options type (sqlite, json)
});

db.set("x.y.z", "roxza"); // roxza

db.fetch("x"); // {y: {z: "roxza"}}

db.add("b", 8); // {b: "8"}

db.subtract("b", 4); // {b: "4"}

db.has("x"); // true

db.delete("x"); // true

db.dataAll(); // {}

db.DataAllDelete(); // true
```
