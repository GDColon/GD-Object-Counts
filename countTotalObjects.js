const fs = require('fs')
let lvls = fs.readdirSync('./levels').filter(x => x.endsWith(".json"))

function commafy(num) { return (num || 0).toString().replace(/(\d)(?=(\d\d\d)+$)/g, "$1,") } // regex to add commas to large numbers

let totalObjects = 1911
let objects = {}
let unique = {}
let objTable = Array(totalObjects + 2).fill().map(() => Array(lvls.length + 1).fill(0)) // 2D table of zeroes
objTable.forEach((x, y) => x[0] = (y == 1 ? "Total" : y-1))
objTable[0][0] = "(object ID)"
objTable[0][1] = "ALL LEVELS"

// sort by name
lvls = lvls.sort((a, b) => a.split(" - ")[1].localeCompare(b.split(" - ")[1]))

lvls.forEach((file, index) => {
    let obj = fs.readFileSync('./levels/' + file, 'utf-8')
    obj = JSON.parse(obj)
    Object.keys(obj).forEach(objID => {
        let count = obj[objID]
        if (!objects[objID]) objects[objID] = count
        else objects[objID] += count
        if (!unique[objID]) unique[objID] = 1
        else unique[objID]++
        objTable[objID == "total" ? 1 : (+objID) + 1][index+2] = count // add to table
    })
    let [levelID, levelName] = file.split(".json")[0].split(" - ") // parse name and ID from filename
    objTable[0][index+2] = `"${levelName} (${levelID})"` // name on row 1
})

for (i=1; i<=totalObjects; i++) {
    if (!objects[i]) objects[i] = 0
    objTable[i+1][1] = objects[i]
}
objTable[1][1] = objects["total"]

let sortedObjs = Object.entries(objects).sort((a,b) => b[1]-a[1]).map(x => `${x[0]}:\t\t${commafy(x[1])}\t\t${unique[x[0]] || 0}/${lvls.length}`).join("\n")
fs.writeFileSync('totalObjects.txt', sortedObjs, 'utf-8')
console.log("Saved total object list!")

let csv = objTable.map(x => x.join(",")).join("\n")
fs.writeFileSync('objectTable.csv', csv, 'utf-8')
console.log("Saved object table!")