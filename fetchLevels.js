
return console.log("Hi hey only use this if you're REALLY desperate for answers or something. it sends a lot of requests to RobTop's servers and that's probably not a cool thing to do. comment out this line if you really know what you're doing here.'")

const request = require('request')
const zlib = require('zlib')
const fs = require('fs');

function parseResponse(responseBody, splitter=":") {
    if (!responseBody || responseBody == "-1") return {};
    let response = responseBody.split('#')[0].split(splitter || ':');
    let res = {};
    for (let i = 0; i < response.length; i += 2) {
    res[response[i]] = response[i + 1]}
    return res  
}

let levelList = []
let levelLists = fs.readdirSync('./lists')
levelLists.forEach(x => levelList.push(require(`./lists/${x}`))) // add each level from /levels directory to list
levelList = levelList.flat() // flatten
levelList = levelList.filter((x, y) => levelList.indexOf(x) == y) // remove duplicates
  
function download(id) {

// please be VERY mindful when using this - spamming RobTop's servers is not a nice thing to do
request.post('http://boomlings.com/database/downloadGJLevel22.php', {form: {levelID: id, secret: "Wmfd2893gb7"}}, function(err, res, body) {
    if (err || body == "-1") return console.log("> Error downloading " + id)
    let parsed = parseResponse(body)
    zlib.unzip(Buffer.from(parsed[4], 'base64'), (err, buffer) => {
        if (err) return console.log("> Error decoding " + id)

        let levelData = buffer.toString()
        let data = levelData.split(";")
        let objects = {total: 0}
        let header = data.shift()

        data.forEach(x => {
            let obj = parseResponse(x, ",")
            let objID = obj[1]
            if (!objID) return
            if (!objects[objID]) objects[objID] = 1
            else objects[objID]++
            objects.total++
        })

        fs.writeFileSync(`./levels/${id} - ${parsed[2]}.json`, JSON.stringify(objects, null, 2), 'utf-8')
        console.log("Saved " + id)
    });

})

}

console.log(`Preparing ${levelList.length} levels...`)

let lvlIndex = -1
setInterval(() => {
    lvlIndex++
    let nextLvl = levelList[lvlIndex]
    if (!nextLvl) {
        console.log("All done!")
        process.exit()
    }
    console.log(`Downloading ${nextLvl} (${lvlIndex+1}/${levelList.length})`)
    download(nextLvl)
}, 5000);