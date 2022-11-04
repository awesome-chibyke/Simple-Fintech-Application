const fetch = require("node-fetch");

exports.GetRequest = (url) => {
  return new Promise(function (resolve, reject) {
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        resolve(json);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.PostRequest = (
  url,
  body = {},
  headersVAlue = { "Content-Type": "application/json" }
) => {
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: "post",
      body: JSON.stringify(body),
      headers: headersVAlue,
    })
      .then((res) => {res.status; res.json(); })
      .then((json) => {
        resolve({ status: sta, json: json });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
