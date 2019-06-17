const Koa = require('koa')
const Router = require('koa-router')
const joi = require('joi')
const validate = require('koa-joi-validate')
const app = new Koa()
const router = new Router()
const config = require('./config/config')
const es_search = require('./services/es_search')

/** 
 * Autocomplete API 
 * Search for a term in the library
 * 
 * Query Params -
 * term: string under 60 characters
 * userId: userId in business system
 * offset: positive integer, default 0
 * size: the result size, default 10
 */
router.get('/completion',
    validate({
        query: {
            term: joi.string().max(60).required(),
            userId: joi.string().max(100).required(),
            offset: joi.number().integer().min(0).default(0),
            size: joi.number().integer().min(0).default(10)
        }
    }),
    async (ctx, next) => {
        const {
            term,
            userId,
            offset,
            size
        } = ctx.request.query
        result_body = await es_search.search(term, userId, offset, size)
        result_array = []
        completion_suggest = result_body.body.suggest.completion_suggest
        if (Array.isArray(completion_suggest) && completion_suggest.length > 0) {
            result_options = completion_suggest[0].options
            for (i in result_options) {
                result_array.push(result_options[i].text)
            }
        }
        ctx.body = result_array
    }
)

/**
 * Log each request to the console
 */
app.use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

/**
 * Log percolated errors to the console
 */
app.on('error', err => {
    console.error('Server Error', err)
})

/**
 * Set permissive CORS header
 */
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    return next()
})

const port = process.env.PORT || config.port
console.log('active env：' + config.env);
app.use(router.routes())
    .use(router.allowedMethods())
    .listen(port, err => {
        if (err) console.error(err)
        console.log(`App Listening on Port ${port}`)
    })
