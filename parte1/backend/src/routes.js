const url = require('url')

class Routes {
  #io
  constructor(io) {
    this.#io = io
  }

  async post(req, res) {
    const { headers } = req
    const { query: { socketId } } = url.parse(req.url, true)

    this.#io.to(socketId).emit('file-uploaded', 5e9)
    this.#io.to(socketId).emit('file-uploaded', 5e9)
    this.#io.to(socketId).emit('file-uploaded', 5e9)
    this.#io.to(socketId).emit('file-uploaded', 5e9)
    const onFinish = (res, redirectTo) => {
      res.writeHead(303, {
        Connection: 'close',
        Location: `${redirectTo}?msg=Files uploaded with success!`
      })
      res.end()
    }

    setTimeout(() => {
      return onFinish(res, headers.origin)
    }, 2000);
  }
}

module.exports = Routes