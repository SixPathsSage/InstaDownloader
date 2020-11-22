const express = require('express');
const app = express();
const cors = require("cors");
var bodyParser = require('body-parser')
var paths = require('path')
var jsonParser = bodyParser.json();

const http = require('https');
const fs = require('fs');

app.use(cors())
app.use(jsonParser)
app.get('/', (req, res) => {
    res.send('Oh Hi There!');
});

app.post('/api/url', jsonParser, (req, res) => {
    console.log(req.body);
    var url = req.body.url;

    http.get(url, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var instaResponse = JSON.parse(body);
            process(instaResponse)
            console.log("Got a response: ", instaResponse);
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
    });
    res.send("Success");
});

function process(data) {
    const id = data.graphql.shortcode_media.owner.username + '_' + data.graphql.shortcode_media.id;
    if (data.graphql.shortcode_media.is_video) {
        const url = data.graphql.shortcode_media.video_url;
        download(url, id, 'mp4');
    } else {
        if (data.graphql.shortcode_media.__typename == 'GraphImage') {
            const url = data.graphql.shortcode_media.display_resources[2].src;
            download(url, id, 'jpg');
        } else {
            const sideCarEdges = data.graphql.shortcode_media.edge_sidecar_to_children.edges;
            var counter = 1;
            sideCarEdges.forEach(edge => {
                const url = edge.node.display_resources[2].src;
                download(url, id + '_' + counter, 'jpg');
                counter += 1;
            });
        }
    }

}

function download(url, id, ext) {
    console.log(url);
    http.get(url,
        function (response) {
            const file = fs.createWriteStream('Downloads/' + id + '.' + ext);
            response.pipe(file);
        });
}

app.listen(3001, () => console.log('Listening on port 3001'));