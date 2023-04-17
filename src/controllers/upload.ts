import { Request, Response } from "express";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid'
import { storageFirebase } from "../config/firebase";
import FileSchema from '../models/Files'
import { FileInterface } from "../interfaces/interfaces";
import { validateNote } from "../utils/notes";
import { validateFileExists } from "../utils/files";
import { validateProfileImage } from "../utils/users";
import { uploadProfileImageUser } from "./users";

export const uploadFilesFirebase = async (id: string, user: string, file: Express.Multer.File, icon?: string, profileImage?: boolean)
  : Promise<any | string | undefined> => {
  const { originalname, buffer, mimetype } = file
  const typeFile = mimetype.split('/')[0]
  try {
    const idFile = uuidv4()
    const refFile = profileImage ? `profile/${user}/${idFile}` : `${user}/${mimetype}/${idFile}`
    const storageRef = ref(storageFirebase, refFile)
    await uploadBytes(storageRef, buffer)
    const url = await getDownloadURL(storageRef)
    if(profileImage) return { url, refFile }
    const data : FileInterface = { 
      file_name: originalname,
      note: id,
      ref: refFile,
      url,
      user,
      typeFile,
      icon: icon ? icon : ''
    }
    const newFile = new FileSchema(data)
    return await newFile.save()
  } catch (error) {
    console.log(error)
    return 'Error del servidor'
  }
}

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if(!req.files) return res.status(400).send({ error: "Not files" })
    const { id } = req.params
    const user = req.user
    const { icon } = req.body
    const validate = await validateNote(id, user)
    if(!validate) return res.status(400).send({ error: 'Error server' })
    const dataIcons = typeof icon === 'string' ? [ icon ] : icon
    const promises: any[] = []
    const files: Express.Multer.File[] = req.files as Express.Multer.File[]
    files.forEach((file, i) => promises.push(uploadFilesFirebase(id, user, file, dataIcons[i])))
    await Promise.all(promises)
    const filesNote = await getFilesByNote(id, user)
    const note = validate
    note.files = filesNote
    return res.status(200).send({ note })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    if(!req.files) return res.status(400).send({ error: "Not files" })
    const { id } = req.params
    const user = req.user
    const validate = await validateNote(id, user)
    if(!validate) return res.status(400).send({ error: 'Error server' })
    const promises: any[] = []
    const files: Express.Multer.File[] = req.files as Express.Multer.File[]
    files.forEach((file) => promises.push(uploadFilesFirebase(id, user, file)))
    await Promise.all(promises)
    const filesNote = await getFilesByNote(id, user)
    const note = validate
    note.files = filesNote
    return res.status(200).send({ note })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const deleteFileById = async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user
  const validate = await validateFileExists(id, user)
  if(!validate) return res.status(400).send({ error: 'Bad request' })
  try {
    const resp = await deleteFile(id)
    if(!resp) return res.status(500).send({ error: 'Error server' })
    return res.status(200).send({ msg: 'File deleted' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const deleteManyFiles = async (req: Request, res: Response) => {
  try {
    const { files } = req.body
    const promises: any[] = []
    files.forEach((file: string) => promises.push(deleteFile(file)))
    await Promise.all(promises)
    return res.status(200).send({ msg: 'Files Deleted' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Error server' })
  }
}

export const deleteFile = async (id: string, refFile?: string) : Promise<boolean | undefined | null> => {
  try {
    if(refFile){
      const refData = ref(storageFirebase, refFile)
      await deleteObject(refData)
      return true
    }
    return await FileSchema.findByIdAndUpdate(id, { state: false }, { new: true })
  } catch (error: any) {
    console.log(error)
    if(error.code && error.code === 'storage/object-not-found') return true
  }
}

export const getFilesByNote = async (note: string, user: string) => {
  const query = { user, note, state: true }
  const files = await FileSchema.find(query)
  if(!files) return { filesData: [], mediaData: [] }
  const filesData: any[] = []
  const mediaData: any[] = []
  files.forEach((file) => {
    const { typeFile, url, file_name, _id } = file
    const newFile = { type: typeFile, url, file_name, _id }
    typeFile === 'application' ? filesData.push(newFile) : mediaData.push(newFile)
  })
  return { filesData, mediaData }
}

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if(!req.files) return res.status(400).send({ error: "Not files" })
    let bandera = true
    const user = req.user
    const validateProfile = await validateProfileImage(user)
    if(validateProfile) {
      const resp = await deleteFile('', validateProfile)
      if(!resp) bandera = false
    }
    if(!bandera) return res.status(500).send({ error: 'Error delete image firebase' })
    const files: Express.Multer.File[] = req.files as Express.Multer.File[]
    const respFirebase = await uploadFilesFirebase('', user, files[0], undefined, true)
    if(!respFirebase) return res.status(500).send({ error: 'Error upload file to firebase' })
    const { url, refFile } = respFirebase
    const newUser = await uploadProfileImageUser(user, url, refFile)
    if(!newUser) return res.status(500).send({ error: 'Error upload profile image' })
    return res.status(200).send({ user: newUser })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}