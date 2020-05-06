"use strict"
let asyncQuene = require("async").queue
let fs = require("fs")
let request = require("superagent")
var chunk = require("lodash/chunk")
require("superagent-charset")(request)
const mergeImg = require("merge-img")

const Config = {
    maxWidth: 4,
    maxHeight: 4,
    startPage: 725, //当前图片地址编码
    endPage: 1,
    downloadImg: true, //是否下载图片到硬盘,否则只保存Json信息到文件
    downloadConcurrent: 10, //下载图片最大并发数
    currentImgType: "w", //当前程序要爬取得图片类型,取下面AllImgType的Key。
    currentNumberque: 725 //要爬取的序号
}

const AllImgType = {
    //网站的图片类型
    w:
        "https://ocula.com/art-galleries/galeria-nara-roesler/artworks/abraham-palatnik/w-",
    relevo:
        "https://ocula.com/art-galleries/galeria-nara-roesler/artworks/abraham-palatnik/relevo-untitled-",
    untitled:
        "https://ocula.com/art-galleries/galeria-nara-roesler/artworks/abraham-palatnik/untitled-"
}

let getAlbumsAsync = function() {
    return new Promise(function(resolve, reject) {
        console.log("Start get albums .....")
        let albums = []
        let q = asyncQuene(async function(url, taskDone) {
            console.log(url)
            try {
                console.log(`download ${url} success`)
                for (let w = 0; w <= Config.maxWidth; w++) {
                    for (let h = 0; h <= Config.maxHeight; h++) {
                        albums.push({
                            url:
                                AllImgType[Config.currentImgType] +
                                Config.currentNumberque +
                                "/" +
                                w +
                                "_" +
                                h,
                            title: `${Config.currentNumberque}_${w}_${h}`,
                            imgList: [
                                "https://i.ocula.com/anzax/51/5153f4eb-d729-47d5-9323-baf1d0eccf35_files/11/" +
                                    w +
                                    "_" +
                                    h +
                                    ".jpg"
                            ]
                        })
                    }
                }
            } catch (err) {
                console.log(
                    `Error : get Album list - download ${url} err : ${err}`
                )
            } finally {
                if (Config.downloadImg) {
                    // downloadImg(albums) //下载里面的所有图片
                }
                taskDone() // 一次任务结束
            }
        }, 10) //html下载并发数设为10
        /**
         * 监听：当所有任务都执行完以后，将调用该函数
         */
        q.drain = function() {
            console.log("Get album list complete")
            resolve(albums) //返回所有
        }

        let pageUrls = []
        let imageTypeUrl = AllImgType[Config.currentImgType]
        pageUrls.push(imageTypeUrl)
        q.push(pageUrls)
    })
}

let getImageListAsync = function(albumsList) {
    return new Promise(function(resolve, reject) {
        console.log("Start get album`s imgList ....")
        let q = asyncQuene(async function(
            { url: albumUrl, title: albumTitle, imgList },
            taskDone
        ) {
            try {
            } catch (err) {
                console.log(
                    `Error :get image list - download ${albumUrl} err : ${err}`
                )
            } finally {
                taskDone() // 一次任务结束
            }
        },
        10) //html下载并发数设为10
        /**
         * 监听：当所有任务都执行完以后，将调用该函数
         */
        q.drain = function() {
            console.log("Get image list complete")
            resolve(albumsList)
        }

        //将所有任务加入队列
        q.push(albumsList)
    })
}

function downloadImg(albumList) {
    console.log("Start download album`s image ....")
    const folder = `img-${Config.currentImgType}-${Config.startPage}-${Config.endPage}`
    fs.mkdirSync(folder)
    let downloadCount = 0
    let q = asyncQuene(async function(
        { title: albumTile, url: imageUrl },
        taskDone
    ) {
        request.get(imageUrl).end(function(err, res) {
            if (err) {
                console.log("request off,no link http image source ,403")
                taskDone()
            } else {
                fs.writeFile(
                    `./${folder}/${albumTile}-${++downloadCount}.jpg`,
                    res.body,
                    function(err) {
                        err
                            ? console.log("Back off,no link http image source!")
                            : console.log(`${albumTile} 保存一张`)
                        taskDone()
                    }
                )
            }
        })
    },
    Config.downloadConcurrent)
    /**
     * 监听：当所有任务都执行完以后，将调用该函数
     */
    q.drain = function() {
        console.log("All img download")
        // 拼接全部
        setTimeout(() => {
            horizenMerge()
        }, 0)
        setTimeout(() => {
            vitcalMerge()
        }, 5000)
    }

    let imgListTemp = []
    albumList.forEach(function({ title, imgList }) {
        imgList.forEach(function(url) {
            imgListTemp.push({ title: title, url: url })
        })
    })
    q.push(imgListTemp) //将所有任务加入队列
}

// 竖向合并
let horizenMerge = function() {
    return new Promise(function(resolve, reject) {
        let files = fs.readdirSync("img-w-725-1")
        let imgtemparr = []
        for (let i in files) {
            let temp = "./img-w-725-1/" + files[i].replace("\\", "/")
            imgtemparr.push(temp)
        }
        let aaa = chunk(imgtemparr, 4)
        fs.exists("imgsource", function(exists) {
            if (exists) {
                deleteall("imgsource")
            }
        })
        setTimeout(() => {
            const folder1 = `imgsource`
            fs.mkdirSync(folder1)
            aaa.forEach(function(item, index) {
                mergeImg(item, { direction: true }).then(img => {
                    img.write(`./imgsource/v${index}.jpg`, () => {})
                })
            })
        }, 0)
    })
}
function deleteall(path) {
    var files = []
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path)
        files.forEach(function(file, index) {
            var curPath = path + "/" + file
            if (fs.statSync(curPath).isDirectory()) {
                // recurse
                deleteall(curPath)
            } else {
                // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}
// 横向合并
let vitcalMerge = function() {
    let file1 = fs.readdirSync("imgsource")
    let imgtemparr2 = []
    for (let i in file1) {
        let temp = "./imgsource/" + file1[i].replace("\\", "/")
        imgtemparr2.push(temp)
    }
    mergeImg(imgtemparr2, { direction: false }).then(img => {
        img.write(`finalimg.jpg`, () => {})
    })
}

async function spiderRun() {
    let albumList = await getAlbumsAsync() //获取所有URL
    albumList = await getImageListAsync(albumList) //根据URL获取里的所有图片URL
    if (Config.downloadImg) {
        downloadImg(albumList) //下载里面的所有图片
    }
}

spiderRun()
