const Busboy = require("busboy")
const { logger, pipelineAsync } = require('./utils')
const { join } = require('path')
const { createWriteStream } = require('fs')

class UploadHandler {
  #io
  #socketId
  constructor(io, socketId) {
    this.#io = io
    this.#socketId = socketId
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers })

    busboy.on("file", this.#onFile.bind(this))

    busboy.on('finish', onFinish)
  }

  #handleFileBytes(filename) {
    async function* handleData(data) {
      for await (const item of data) {
        const size = item.length
        logger.info(`File [${filename}] got ${size} to ${this.#socketId}`)
        this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, size)
        yield item
      }
    }

    return handleData.bind(this)
  }

  async #onFile(fieldname, file, filename) {
    const saveFileTo = join(__dirname__, '../downloads', filename)
    logger.info('Uploading: ' + saveFileTo)
    await pipelineAsync(
      file,
      this.#handleFileBytes.apply(this, [filename]),
      createWriteStream(saveFileTo)
    )

    logger.info(`File [${filename}] finished!`)
  }
}

module.exports = UploadHandler