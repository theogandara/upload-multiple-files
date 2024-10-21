const url = require('url')
const UploadHandler = require('./uploadHandler')
const { pipelineAsync, logger } = require('./utils')

class Routes {
  #io
  constructor(io) {
    this.#io = io
  }

  options(req, res) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST'
    })

    res.end()
  }
  async post(req, res) {
    const { headers } = req
    const { query: { socketId } } = url.parse(req.url, true)
    const redirectTo = headers.origin

    const uploadHandler = new UploadHandler(this.#io, socketId)

    const onFinish = (res, redirectTo) => () => {
      res.writeHead(303, {
        Connection: 'close',
        Location: `${redirectTo}?msg=Files uploaded with success!`
      })
      res.end()
    }

    const busboyInstance = uploadHandler.registerEvents(headers, onFinish(res, redirectTo))

    await pipelineAsync(
      req,
      busboyInstance
    )

    logger.info("Request finished with success!")
  }
}

module.exports = Routes