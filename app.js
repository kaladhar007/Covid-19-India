const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at https//localhost:3000");
    });
  } catch (e) {
    console.log(`DBError:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//### API 1

//#### Path: `/states/`

//#### Method: `GET`

//#### Description:

//Returns a list of all states in the state table

//#### Response

//```
//[
//{
//stateId: 1,
//stateName: "Andaman and Nicobar Islands",
//population: 380581
//},

//...
//]
//```
app.get(`/states/`, async (request, response) => {
  const listOfStates = request.body;
  const stateListQuery =
    "select state_id as stateId, state_name as stateName, population from state;";
  const dbResponse = await db.all(stateListQuery);
  response.send(dbResponse);
});

//### API 2

//#### Path: `/states/:stateId/`

//#### Method: `GET`

//#### Description:

//Returns a state based on the state ID

//#### Response

//```
//{
//stateId: 8,
//stateName: "Delhi",
//population: 16787941
//}
//```
app.get(`/states/:stateId/`, async (request, response) => {
  const obj = request.body;
  const { stateId } = request.params;

  const getByIdQuery = `SELECT state_id as stateId, state_name as stateName,population FROM state WHERE state_id=${stateId}`;
  const dbResponse = await db.get(getByIdQuery);
  response.send(dbResponse);
});

//### API 3

//#### Path: `/districts/`

//#### Method: `POST`

//#### Description:

//Create a district in the district table, `district_id` is auto-incremented

//#### Request

//```
//{
//"districtName": "Bagalkot",
//"stateId": 3,
//"cases": 2323,
//"cured": 2000,
//"active": 315,
//"deaths": 8
//}
//```

//#### Response

//```
//District Successfully Added
//```
app.post(`/districts/`, async (request, response) => {
  const details = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = details;
  const districtAddQuery = `INSERT INTO 
                                district(district_name,state_id,cases,cured,active,deaths)
                                VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths})`;
  const dbResponse = await db.run(districtAddQuery);
  response.send(`District Successfully Added`);
});

//### API 4

//#### Path: `/districts/:districtId/`

//#### Method: `GET`

//#### Description:

//Returns a district based on the district ID

//#### Response

//```
//{
//districtId: 322,
//districtName: "Haveri",
//stateId: 36,
//cases: 2816,
//cured: 2424,
//active: 172,
//deaths: 220,
//}
//```
app.get(`/districts/:districtId/`, async (request, response) => {
  const districtDetails = request.body;
  const { districtId } = request.params;
  const getQuery = `SELECT district_id as districtId,district_name as districtName, state_id as stateId, cases,cured,active,deaths FROM district WHERE district_id=${districtId}`;
  const dbResponse = await db.get(getQuery);
  response.send(dbResponse);
});

//### API 5

//#### Path: `/districts/:districtId/`

//#### Method: `DELETE`

//#### Description:

//Deletes a district from the district table based on the district ID

//#### Response

//```
//District Removed

//```
app.delete(`/districts/:districtId/`, async (request, response) => {
  const { districtId } = request.params;
  const sqliteQuery = `DELETE FROM district where district_id=${districtId};`;
  const dbResponse = await db.run(sqliteQuery);
  response.send("District Removed");
});

//### API 6

//#### Path: `/districts/:districtId/`

//#### Method: `PUT`

//#### Description:

//Updates the details of a specific district based on the district ID

//#### Request

//```
//{
//"districtName": "Nadia",
//"stateId": 3,
//"cases": 9628,
//"cured": 6524,
//"active": 3000,
//"deaths": 104
//}
//```

//#### Response

//```

//District Details Updated

//```
app.put(`/districts/:districtId/`, async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const UpdateQuery = `UPDATE district
                            SET district_name='${districtName}',state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths};`;
  const dbResponse = await db.run(UpdateQuery);
  response.send(`District Details Updated`);
});
//### API 7

//#### Path: `/states/:stateId/stats/`

//#### Method: `GET`

//#### Description:

//Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

//#### Response

//```
//{
//totalCases: 724355,
//totalCured: 615324,
//totalActive: 99254,
//totalDeaths: 9777
//}

//```
app.get(`/states/:stateId/stats/`, async (request, response) => {
  const { stateId } = request.params;
  const stats = `SELECT SUM(cases) as totalCases, SUM(cured) as totalCured, SUM(active) as totalActive, SUM(deaths) as totalDeaths 
FROM state INNER JOIN district ON state.state_id = district.state_id 
WHERE district.state_id = ${stateId};`;
  const dbResponse = await db.get(stats);
  response.send(dbResponse);
});
//### API 8

//#### Path: `/districts/:districtId/details/`

//#### Method: `GET`

//#### Description:

//Returns an object containing the state name of a district based on the district ID

//#### Response

//```

//{
//stateName: "Maharashtra"
//}

//```
app.get(`/districts/:districtId/details/`, async (request, response) => {
  const { districtId } = request.params;
  const stateQuery = `SELECT state.state_name as stateName
                            FROM state 
                            INNER JOIN district ON state.state_id = district.state_id 
                            WHERE district.district_id = ${districtId};`;
  const dbResponse = await db.get(stateQuery);
  response.send(dbResponse);
});

//<br/>

//Use `npm install` to install the packages.

//**Export the express instance using the default export syntax.**

//**Use Common JS module syntax.**
module.exports = app;
