const http = require("node:http")
const socketIo = require("socket.io")
const Routes = require("./routes")
const { logger } = require('./utils')
const PORT = 3000

const handler = function (req, res) {
  const defaultRoute = async (req, res) => res.end("hello")
  const routes = new Routes(io)
  const chosen = routes[req.method.toLowerCase()] || defaultRoute
  return chosen.apply(routes, [req, res])
}

const server = http.createServer(handler)
const io = socketIo(server, {
  cors: {
    origin: "*",
    credentials: false
  }
})

io.on("connection", (socket) => logger.info("someone connected " + socket.id))

const startServer = () => {
  const { address, port } = server.address()
  logger.info(`app running at http://${address}:${port}`)
}

server.listen(PORT, startServer)