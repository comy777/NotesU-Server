import { Request, Response, Router } from 'express'
import { check } from 'express-validator'
import multer from 'multer'
import { activateAccout, createUser, loginUser, refreshToken, verifyEmail, veryfyAccount } from '../controllers/auth'
import { getIconFaticon } from '../controllers/faticon'
import { deleteNote, getNoteById, getNotes, saveNote, saveNotes, updateNote } from '../controllers/notes'
import { deleteFileById, deleteManyFiles, uploadFile, uploadFiles, uploadProfileImage } from '../controllers/upload'
import { validate, validateTokenHeader } from '../middlewares/validate'
import { getUser } from '../controllers/users'
import { getCategories, saveCategorie, updateCategorie } from '../controllers/categories'

const routes = Router()
const authRoutes = Router()
const users = Router()
const categories = Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

const validateForm = [
  check('email', 'Email required').isEmail(),
  check('password', 'Password need 8 characteres').isLength({ min: 8 }),
  validate
]

//Login
authRoutes.post('', validateForm, loginUser)

//Register
authRoutes.post('/create-account', validateForm, createUser)

//Verify email
authRoutes.post('/verify-email', [
  check('email', 'Email address is required').notEmpty(),
  check('email', 'Email not valid').isEmail(),
  validate
],(req: Request, res: Response) => verifyEmail(req, res))

//Send email to verify
authRoutes.get('/verify-account', (req: Request, res: Response) => veryfyAccount(req, res))

//Activate account
authRoutes.get('/activated-account', (req: Request, res: Response) => activateAccout(req, res))

//Email reset Password
authRoutes.post('/reset-password', [
  check('email', 'Email address is required').notEmpty(),
  check('email', 'Email not valid').isEmail(),
  validate
], (req: Request, res: Response) => verifyEmail(req, res, true))

//Restore password
authRoutes.get('/reset-password-user', (req: Request, res: Response) => veryfyAccount(req, res, true))

//Reset new password
authRoutes.post('/restore-password', (req: Request, res: Response) => activateAccout(req, res, true))

//Refresh token
authRoutes.get('/refresh-token/:token', [
  check('token', 'Token required').notEmpty(),
  validate
], refreshToken)

//Get notes by user
routes.get('', [validateTokenHeader], getNotes)

//Get note
routes.get('/:id', [validateTokenHeader], getNoteById)

//Save note
routes.post('', [ validateTokenHeader, check('categorie', 'Id not valid').isMongoId(), validate ], saveNote)

//Update note
routes.put('/:id', [
  validateTokenHeader, 
  check("id", "Id not valid").isMongoId(),
  validate
], updateNote)

//Delete note
routes.delete('/:id', [
  validateTokenHeader, 
  check("id", "Id not valid").isMongoId(),
  validate
], deleteNote)

//Save Notes
routes.post('/save-notes', [validateTokenHeader], saveNotes)

//Files
routes.post('/files/:id',
  [
    validateTokenHeader, 
    check('id', 'Id not valid').isMongoId(), 
    validate, 
    upload.any()
  ],
  uploadFile
)

routes.post('/manyfiles/:id',
  [
    validateTokenHeader, 
    check('id', 'Id not valid').isMongoId(), 
    validate, 
    upload.array('upload_file', 5)
  ],
  uploadFiles
)

routes.delete('/files/:id',
  [
    validateTokenHeader, 
    check('id', 'Id not valid').isMongoId(), 
    validate
  ],
  deleteFileById
)

routes.post('/delete-files', [validateTokenHeader], deleteManyFiles)

routes.put('/user/upload-profile-image', [validateTokenHeader, upload.any()], uploadProfileImage)

//Faticon
routes.get('/faticon/:search', [validateTokenHeader], getIconFaticon)

//Users
users.get('/', [validateTokenHeader], (req: Request, res: Response) => getUser(req, res))

//Update user
users.put('/', [validateTokenHeader], (req: Request, res: Response) => getUser(req, res, true))

//Categories
categories.get('/', [ validateTokenHeader ], getCategories)

categories.post('/', [
  validateTokenHeader,
  check('categorie', 'Categorie required').notEmpty(),
  validate
], saveCategorie)

categories.put('/:id', [
  validateTokenHeader,
  check('categorie', 'Categorie required').notEmpty(),
  check('id', 'Id not valid').isMongoId(),
  validate
], (req: Request, res: Response) => updateCategorie(req, res, true))

categories.delete('/:id', [
  validateTokenHeader,
  check('id', 'Id not valid').isMongoId(),
  validate
], (req: Request, res: Response) => updateCategorie(req, res))

export { authRoutes, routes, users, categories }