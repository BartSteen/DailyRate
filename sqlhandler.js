const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");


    var db;

    //open the database EXPORTS
 async function openConnection() {
        db = await sqlite.open({
            filename: 'mydb.db',
            driver: sqlite3.Database
        })
    }

    //Uses db.all to run the query so returns all results
    async function allResQuery(query, params) {
        return await db.all(query, params);
    }

    //Uses db.get to query so only returns the first result
    async function singleResQuery(query, params) {
        return await db.get(query, params);
    }

    //Uses the db.run to run the query
    async function actionQuery(query, params) {
        return await db.run(query, params);
    }

module.exports = {
    openConnection,
    allResQuery,
    singleResQuery,
    actionQuery
}
