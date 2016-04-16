function getCredentials(cb) {
  var data = {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
  };

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/token',
    'data': data,
    'type': 'POST'
  })
  .then(function(r) {
    localStorage.setItem('token', r.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    cb();
  });
}

function postImage(imgurl) {
  var accessToken = localStorage.getItem('token');

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/tag/?select_classes=muffin,dog&url=' + imgurl,
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'type': 'GET'
  }).then(function(r){
    parseResponse(r, imgurl);
  });
}

function parseResponse(resp, imgurl) {
  var probs = [];
  if (resp.status_code === 'OK') {
    var results = resp.results;
    probs = results[0].result.tag.probs;
    console.log(probs);
  } else {
    console.log('Sorry, something is wrong.');
  }

  var text = probs[0] > probs[1] ? 'muffin' : 'chihuahua';

  $('#photos').append('<div><span>' + text + '</span><img src="' + imgurl + '" /></div></div>');
}

function run(imgurl) {
  if (Math.floor(Date.now() / 1000) - localStorage.getItem('tokenTimeStamp') > 86400
    || localStorage.getItem('token') === null) {
    getCredentials(function() {
      postImage(imgurl);
    });
  } else {
    postImage(imgurl);
  }
}
