'use strict';

var config = {
    env: 'prod',
    port: 3000,
    debug: false,
  
    es_region : 'us-west-1',
    es_domain : 'prod******.us-west-1.es.amazonaws.com',
    es_index : 'es_index',
    es_doc_type : 'es_type',
    aws_access_key_id : "aws_access_key_id",
    aws_secret_access_key : "aws_secret_access_key"
};
module.exports=config;
