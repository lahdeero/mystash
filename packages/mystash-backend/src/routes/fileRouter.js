const fs = require('fs');
const { dirname } = require('path');
const fileRouter = require('express').Router()
const pool = require('../db')
const verifyJWT = require('../middlewares/verifyJWT')
const { create, findOne } = require('../models/file')
const multer  = require('multer');
const tierlist = require('../utils/tierlist');
const userModel = require('../models/user')

const upload_path = process.env.FILE_UPLOAD_PATH
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const finalPath = `${upload_path}/${req.user.id}`
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true })
    }
    cb(null, finalPath)
  },
  filename: (_req, file, cb) => {
    const prefix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const suffix = file.originalname

    const finalName = prefix.length + suffix.length > 128 ?
      `${prefix}.${suffix.split(".").pop()}` :
      `${prefix}${suffix}`

    cb(null, finalName)
  }
})
const validateRequest = (req) => {
  const { body } = req
  if (!body.note_id) throw new Error('note id missing')
}
const fileFilter = (req, file, cb) => {
  console.log("req", req)
  const user = userModel.findOne(req.user.id)
  if (user.tier === tierlist.ADMIN) {
    cb(null, true)
  } else if (file.size > 1_000_000) {
    cb(null, false)
  } else {
    cb(null, true)
  }
}
const upload = multer({ storage: storage, fileFilter})

fileRouter.all('*', verifyJWT.verifyJWT_MW)

// req.file is the `upload` file
// req.body will hold the text fields, if there were any
fileRouter.post('/upload', upload.single('picture'), async (req, res) => {
  console.log("body", req.body)
  console.log("file", req.file)
  try {
    validateRequest(req, res)
    const persistedFile = await create(req.file, req.user.id, req.body.note_id)
    res.status(200).json(persistedFile)
  } catch (exception) {
    console.error(exception)
    return res.status(500).json(
      {
        message: 'Could not upload the file',
        exception: exception.toString()
      }
    )
  }
})

fileRouter.get('/picture/:id', async (req, res) => {
  if (!req.params.id) throw new Error('file id missing')

  try {
    const fileObj = await findOne(req.params.id, req.user.id)
    res.download(`${upload_path}/${req.user.id}/${fileObj.filename}`)
  } catch (exception) {
    console.error(exception)
    return res.status(500).json(
      {
        message: 'Could not download the file',
        exception: exception.toString()
      }
    )
  }
})

module.exports = fileRouter
