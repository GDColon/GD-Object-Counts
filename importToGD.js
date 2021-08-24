const fs = require('fs')
const zlib = require('zlib')
const editorObjects = require('./misc/editorObjects.json') // list of objects that appear in the editor (not including hidden ones)
let data = require('./misc/levelTemplate.json') // basic level data template

let gdLevels = process.env.HOME || process.env.USERPROFILE + "/AppData/Local/GeometryDash/CCLocalLevels.dat"
let list = fs.readFileSync('./totalObjects.txt', 'utf-8').split("\n").slice(1).map(x => x.split("\t").filter(x => x))
list = list.map(x => ({id: x[0].split(":")[0], amount: x[1], levels: x[2]}))

// feel free to modify these!
let xPos = 195
let yPos = 2385
let ySpacing = 60
let xSpacing = 600
let columnSize = 40
let includeUnlistedObjects = false
let sortByLeast = false

if (sortByLeast) list.reverse()

let counter = 0
let levelData = list.map(x => {
    if (!includeUnlistedObjects && !editorObjects.includes(+x.id)) return
    let col = Math.floor(counter / columnSize);
    let xx = xPos + (col * xSpacing);
    let yy = yPos - ((counter % columnSize) * ySpacing);
    counter++
    return `1,${x.id},2,${xx},3,${yy};` + 
    `1,914,2,${xx + 120},3,${yy},31,${Buffer.from(x.amount).toString('base64')};` +
    `1,914,2,${xx + 360},3,${yy},31,${Buffer.from(`${x.levels} (#${counter})`).toString('base64')};`
}).join("")

fs.readFile(gdLevels, 'utf8', function(err, saveData) {

    if (err) return console.log("Error! Could not open or find GD save file")

    if (!saveData.startsWith('<?xml version="1.0"?>')) {
        console.log("Decrypting GD save file...")
        function xor(str, key) {
            str = String(str).split('').map(letter => letter.charCodeAt());
            let res = "";
            for (i = 0; i < str.length; i++) res += String.fromCodePoint(str[i] ^ key);
            return res;
        }
        saveData = xor(saveData, 11)
        saveData = Buffer.from(saveData, 'base64')
        try { saveData = zlib.unzipSync(saveData).toString() }
        catch(e) { return console.log("Error! GD save file seems to be corrupt!\nMaybe try saving a GD level in-game to refresh it?\n") }
    }
    
    console.log("Importing to GD...")
    saveData = saveData.split("<k>_isArr</k><t />")
    saveData[1] = saveData[1].replace(/<k>k_(\d+)<\/k><d><k>kCEK<\/k>/g, function(n) { return "<k>k_" + (Number(n.slice(5).split("<")[0])+1) + "</k><d><k>kCEK</k>" })
    saveData = saveData[0] + "<k>_isArr</k><t />" + data.ham + data.bur + levelData + data.ger + saveData[1]        
    fs.writeFileSync(gdLevels, saveData, 'utf8')
    console.log(`Saved!`);
})