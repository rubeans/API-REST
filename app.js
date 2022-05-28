const express = require("express")
const app = express()
const mongoose = require("mongoose")

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(express.static(`${__dirname}/public`))

main().catch(e => console.error(e))
//Database connection
async function main() {
    try {
        await mongoose.connect("mongodb://localhost:27017/wikiDB")
    } catch (e) {
        console.error(e)
    }

    const articleSchema = new mongoose.Schema({
        title: {
            type: String,
            required: [true, "Title not especified correctly"]
        },
        content: {
            type: String,
            required: [true, "Content not especified correctly"]
        }
    },
        {
            versionKey: false //by doing this it will stop showing the "_v"
        })

    const Article = mongoose.model("Article", articleSchema)

    //Requesting all articles
    app.route("/articles")
        //load articles
        .get((req, res) => {
            Article.find({}, (err, docs) => {
                if (!err) {
                    res.send(docs)
                } else {
                    console.error(err)
                }
            })
        })
        //add a new article
        .post((req, res) => {
            const newArticle = new Article({
                title: req.body.title,
                content: req.body.content
            })
            newArticle.save(err => {
                if (!err) {
                    res.send("New documents added")
                } else {
                    res.send(err)
                }
            })
        })
        //delete all articles
        .delete((req, res) => {
            Article.deleteMany({}, (err) => {
                if (!err) {
                    res.send("All articles deleted sucessfully")
                } else {
                    res.send(err)
                }
            })
        })


    //Requesting a specific article
    app.route("/articles/:articleTitle")
        //load an article
        .get((req, res) => {
            Article.findOne({ title: req.params.articleTitle }, (err, docs) => {
                if (docs) {
                    res.send(docs)
                } else {
                    res.send("Article not found")
                }
            })
        })
        //replace an entire article.
        .put((req, res) => {
            Article.replaceOne({ title: req.params.articleTitle },
                { title: req.body.title, content: req.body.content },
                (err) => {
                    if (!err) {
                        res.send("Sucessfully replaced an article")
                    } else {
                        res.send(err)
                    }
                })
        })
        //update just one 
        .patch((req, res) => {
            Article.updateOne({ title: req.params.articleTitle },
                { $set: req.body },
                (err) => {
                    if (err) {
                        res.send(err)
                    }
                    else {
                        res.send("Sucessfuly update an article")
                    }
                })
        })
        //delete just one
        .delete((req, res) => {
            Article.deleteOne({ title: req.params.articleTitle }, (err) => {
                if (err) {
                    res.send(err)
                } else {
                    res.send("Deleted one article sucessfully")
                }
            })
        })

    //Server incitiallizing
    let port = process.env.PORT
    if (port == null || port == "") {
        port = 3000
    }
    app.listen(port, () => {
        console.log("Server is running")
    })
}
