const AWS = require('aws-sdk');
const config = require('../config/config')
const aws_access_key_id = config.aws_access_key_id;
const aws_secret_access_key = config.aws_secret_access_key;
const region = config.es_region;
const domain = config.es_domain;
const index = config.es_index;

module.exports = {
    search(term, user_id, offset, size) {
        query = init_request_parameters(term, user_id, offset, size)
        const {request, client} = init_search_request_client(query, index);
        return new Promise((resolve, reject) => {
            client.handleRequest(request, null,
                response => {
                    const {statusCode,statusMessage,headers} = response;
                    let body = '';
                    response.on('data', chunk => {
                        body += chunk;
                    });
                    response.on('end', () => {
                        const data = {statusCode,statusMessage,headers};
                        if (body) {
                            data.body = JSON.parse(body);
                        }
                        resolve(data);
                    });
                },
                err => {
                    reject(err);
                });
        });
    }
}

function init_search_request_client(query,index){
    var endpoint = new AWS.Endpoint(domain);
    var request = new AWS.HttpRequest(endpoint, region);
    request.method = 'POST';
    request.path += index + '/_search?pretty';
    request.body = JSON.stringify(query);
    request.headers['host'] = domain;
    request.headers['Content-Type'] = 'application/json';
    request.headers["Content-Length"] = request.body.length;
    var credentials = new AWS.Credentials(aws_access_key_id, aws_secret_access_key)
    var signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(AWS.config.credentials, new Date());
    var client = new AWS.HttpClient();
    return {request, client};
}

function init_request_parameters(term, user_id, offset, size){
    query = {
        "from": offset,
        "size": size,
        "_source": "keyphrase",
        "suggest": {
            "completion_suggest": {
                "prefix": term,
                "completion": {
                    "field": 'keyphrase',
                    "skip_duplicates": true,
                    "size": size,
                    "fuzzy": {
                        "prefix_length": 2,
                        "min_length": 2,
                        "fuzziness": 1
                    },
                    "contexts": {
                        "user_id": [user_id]
                    }
                }
            }
        }
    }
    return query;
}
