var mysql = require("mysql");
var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Narutotwist11",
    database: "cse courses"
});

const express = require("express");
const app = express();
const url = require("url");

app.get("/", (req, res) => {
    writeSearch(req,res);
});

app.get("/schedule", (req, res) => {
    writeSchedule(req, res);
})

port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("server started!");
});

function writeSearch(req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    let query = url.parse(req.url, true).query;

    let search = query.search ? query.search : "";
    let filter = query.filter ? query.filter : "";

    let html = `
    <!DOCTYPE html> 
    <html lang="en">
    
    <head>
        <title> Spring 2021 CSE Class Finder </title>
    </head>

    <body>
        <h1> Spring 2021 CSE Class Finder</h1><br>
        <form method="get" action="/">
            <input type="text" name="search" value="">
            <b>in</b>
            <select name="filter">
                <option value="allFields">All Fields</option>
                <option value="courseName">Course Title</option>
                <option value="courseNum">Course Num</option>
                <option value="instructor">Instructor</option>
                <option value="day">Day</option>
                <option value="time">Time</option>
            </select>
            <input type="submit" value="Submit">
            <br>
            Example searches: 316, fodor, 2:30 PM, MW
    </form>
    <br>
    <a href="/schedule">Go To Schedule<br></a>
    `;

    let sql = "SELECT * FROM classes;";

    if (filter == "allFields") {
        sql = `SELECT * FROM classes 
            WHERE Subject LIKE '%` + search + `%' OR
            CRS LIKE '%` + search + `%' OR
            Title LIKE '%` + search + `%' OR
            Component LIKE '%` + search + `%' OR
            Section LIKE '%` + search + `%' OR
            Days LIKE '%` + search + `%' OR
            \`Start Time\` LIKE '%` + search + `%' OR
            \`End Time\` LIKE '%` + search + `%' OR
            \`Start Date\` LIKE '%` + search + `%' OR
            \`End Date\` LIKE '%` + search + `%' OR
            Duration LIKE '%` + search + `%' OR
            \`Instruction Mode\` LIKE '%` + search + `%' OR
            Building LIKE '%` + search + `%' OR
            Room LIKE '%` + search + `%' OR
            Instructor LIKE '%` + search + `%' OR
            \`Enrollment Cap\` LIKE '%` + search + `%' OR
            \`Wait Cap\` LIKE '%` + search + `%' OR
            Combination LIKE '%` + search + `%' OR
            \`Combination Cap\` LIKE '%` + search + `%';`;
    }

    else if(filter == "courseName") {
        sql = `SELECT * FROM classes
            WHERE Title LIKE '%` + search + `%';`;
    }

    else if(filter == "courseNum") {
        sql = `SELECT * FROM classes
            WHERE CRS LIKE '%` + search + `%';`;
    }

    else if(filter == "instructor") {
        sql = `SELECT * FROM classes
            WHERE Instructor LIKE '%` + search + `%';`;
    }

    else if(filter == "day") {
        sql = `SELECT * FROM classes
            WHERE Days LIKE '%` + search + `%';`;
    }

    else if(filter == "time") {
        sql = `SELECT * FROM classes
            WHERE \`Start Time\` LIKE '%` + search + `%' OR
                \`End Time\` LIKE '%` + search + `%';`;
    }

    con.query(sql, function(err, result, fields) {
        if (err) throw err;
        for (let item of result) {
            html += `
            <button type="button" class="toggle"> CSE ` + item.CRS + ` - ` +
            item.Title + ` - ` + item.Component + ` - Section ` + item.Section + `</button>
            <pre>
            Days: ` + item.Days + `
            Start Time: ` + item['Start Time'] + `
            End Time: ` + item['End time'] + `
            Start Date: ` + item['Start Date'] + `
            End Date : ` + item['End Date'] + `
            Duration: ` + item.Duartion + `
            Instruction Mode: ` + item['Instruction Mode'] + `
            Building: ` + item.Building + `
            Room: ` + item.Room + `
            Instructor: ` + item.Instructor + `
            Enrollment Cap: ` + item['Enrollment Cap'] + `
            Wait Cap : ` + item['Wait Cap'] + `
            Combined Description: ` + item.Combination + `
            Combined Cap: ` + item['Combined Cap'] + ` <form action="/schedule" method="get">
            <button name="add" value="`+ item.Subject + ` ` + item.CRS + ` ` + item.Section +`"> Add Class </button></form></pre>`;
        }
        res.write(html + "\n\n<body>\n<html>");
        res.end();
    });
}

function writeSchedule(req, res) {
    let query = url.parse(req.url, true).query;
    let arr;
    if (Object.keys(query).length !== 0)
        arr = Object.values(query)[0].split(" ");
    else
        arr = ["","",""];

    let addQuery;
    if (Object.keys(query)[0] == "add")
        addQuery = `INSERT INTO schedule SELECT * FROM classes WHERE classes.Subject="`+arr[0]+`" AND classes.CRS="`+arr[1]+`" AND classes.Section="`+arr[2]+`";`;
    else if (Object.keys(query)[0] == "remove")
        addQuery = `DELETE FROM schedule WHERE schedule.Subject="`+arr[0]+`" AND schedule.CRS="`+arr[1]+`" AND schedule.Section="`+arr[2]+`";`;
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title> Schedule </title>
        <style type = text/css>
            table, tr, th, td {
                border: 1px solid black;
                height: 50px;
                vertical-align: bottom;
                padding: 15px;
                text-align: left;
            }
        </style>
    </head>
    <body>
        <h1> Schedule </h1><br>
        <a href="/"><b>Return to Search</b></a>
        <br><br>

        <table>
            <tr>
                <th> Mon </th>
                <th> Tue </th>
                <th> Wed </th>
                <th> Thu </th>
                <th> Fri </th>
            </tr>
            <tr>
                <td> Mon </td>
                <td> Tue </td>
                <td> Wed </td>
                <td> Thu </td>
                <td> Fri </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    con.query(addQuery, function(err, result) {
        if(err) console.log(err);
        con.query(constructDay("M"), function(err, result) {
            if(err) throw err;
            html = html.replace("<td> Mon </td>", getDay(result, "MON"));
            con.query(constructDay("TU"), function(err, result) {
                if(err) throw err;
                html = html.replace("<td> Tue </td>", getDay(result, "TUE"));
                con.query(constructDay("W"), function(err, result) {
                    if(err) throw err;
                    html = html.replace("<td> Wed </td>", getDay(result, "WED"));
                    con.query(constructDay("TH"), function(err, result) {
                        if(err) throw err;
                        html = html.replace("<td> Thu </td>", getDay(result, "THU"));
                        con.query(constructDay("F"), function(err, result) {
                            if(err) throw err;
                            html = html.replace("<td> Fri </td>", getDay(result, "FRI"));
                            res.write(html + "\n\n</body>\n</html>");
                            res.end();
                        });
                    });
                });
            });
        });
    });
}

function getDay(result, header) {
    let str = "<td>";
    for (let item of result) {
        str += "\n<b> " + item[`Start Time`] + " - " +
                item[`End Time`] + "<br><br>" +
                item.Subject + " " + 
                item.CRS + "-" +
                item.Section + " </b><p> " +
                item.Title + "<br><br>" +
                item.Instructor + "<br><br>" +
                `<form action="/schedule" method="get">
                <button name="remove" value="`+ item.Subject + ` ` + item.CRS + ` ` + item.Section +`"> Remove Class </button></form></pre>
                <br/><br/>`;
    }
    return str + "</td>";
}

function constructDay(search) {
    var sql = `SELECT * FROM schedule WHERE Days LIKE '%` + search + `%' ORDER BY 'Start Time';`;
    return sql;
}