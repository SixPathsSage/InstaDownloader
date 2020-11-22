function load() {
    var url = document.getElementById("url").value;

    if(url != null) {
        url = url + "&__a=1"
    }
    push(url);
    // fetch(url).then(data => data.json()).then(data => process(data));
}

function push(url) {
    const body = {'url' : url};
    fetch('http://localhost:3001/api/url', {
        method: "POST", 
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
          }
      }).then(res => {
        console.log("Request complete! response:", res);
      });
   
    // fetch('http://localhost:3001/api/url', {
    //       method: 'POST',
    //       body: body, // string or object
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     }).then(data => data.json()).then(data => print(data));
}

function print(data) {
    console.log(data);
}

function process(data) {
    const id = data.graphql.shortcode_media.owner.username + '/' + data.graphql.shortcode_media.id;
    console.log(url);
    if (data.graphql.shortcode_media.is_video) {
        const url = data.graphql.shortcode_media.video_url;
        download(url, id, 'mp4');
    } else {
        if (data.graphql.shortcode_media.__typename=='GraphImage') {
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
        download(url, id, 'jpg');
    }
    
}

function download(url, id, ext) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      var urlCreator = window.URL || window.webkitURL;
      var objectUrl = urlCreator.createObjectURL(this.response);
      var tag = document.createElement('a');
      tag.href = objectUrl;
      tag.target = '_blank';
      tag.download = id + '.' + ext;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
    };
    xhr.onerror = err => {
      alert('Failed to download picture');
    };
    xhr.send();
  }