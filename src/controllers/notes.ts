import { Request, Response } from "express";
import { isValidObjectId } from 'mongoose'
import moment from 'moment'
import { NoteInterface, NoteMongoose, NoteSaveAPI } from "../interfaces/interfaces";
import Note from "../models/Note";
import { validateNote } from "../utils/notes";
import { deleteFile, getFilesByNote } from "./upload";
import Categories from "../models/Categories";
import { validateCategorie } from "../utils/categories";

export const getNotes = async (req: Request, res: Response) => {
  const { user } = req
  const { search } = req.query
  const query = { user, state: search ? false : true }
  const notes = await Note.find(query, null, { sort: { createdAt: -1 }}) as NoteMongoose[]
  let dataNotes : NoteMongoose[] = [...notes]
  if(search) dataNotes = getNotesPapelera(notes)
  const newNotes = await getNoteFiles(dataNotes, user)
  return res.status(200).send({ notes: newNotes })
}

export const saveNote = async (req: Request, res: Response) => {
  const data = req.body
  const { title, body, background, categorie } = data as NoteInterface
  if(!title && !body) return res.status(400).send({ error: 'Bad request' })
  try {
    const user = req.user
    const note = new Note({ title, body, user, background, categorie })
    await note.save()
    return res.status(200).send({ note })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const updateNote = async (req: Request, res: Response) => {
  const data = req.body
  const { id } = req.params
  const { title, body, background, state, categorie } = data as NoteInterface
  if(!title && !body) return res.status(400).send({ error: 'Bad request' })
  try {
    const user = req.user
    const validate = await validateNote(id, user)
    if(!validate) return res.status(400).send({ error: 'Bad request' })
    const color = background ? background : validate.background
    const note = { title, body, background: color, state: state ? state : true, categorie }
    const resp = await Note.findByIdAndUpdate(id, note, { new: true })
    const noteResp = await getNoteFiles([resp], user)
    return res.status(200).send({ note: noteResp[0] })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const deleteNote = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const user = req.user
    const validate = await validateNote(id, user)
    if(!validate) return res.status(400).send({ error: 'Bad request' })
    await Note.findByIdAndUpdate(id, { state: false })
    const files = await getFilesByNote(id, user)
    if(files){
      const { filesData, mediaData } = files
      const allFiles = [...filesData, ...mediaData]
      if(allFiles.length > 0){
        const promises: any[] = []
        allFiles.forEach((file) => promises.push(deleteFile(file._id)))
        await Promise.all(promises)
      }
    }
    return res.status(200).send({ msg: 'Note deleted' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

const getNotesPapelera = (notes: NoteMongoose[]) : NoteMongoose[] => {
  let dataNotes : NoteMongoose[] = [...notes]
  notes.forEach((note) => {
    const lastDay = moment(note.updatedAt, "YYYYMMDD").fromNow()
    if(lastDay.includes('days')){
      const totalDays = lastDay.split(' ')[0]
      if(parseInt(totalDays) > 6) {
        dataNotes = dataNotes.filter((item) => item._id !== note._id)
      }
    }
  })
  return dataNotes
}

const getNoteFiles = async (dataNotes: any[], user: string) : Promise<NoteMongoose[]> => {
  const newNotes : NoteMongoose[] = []
  for await (const note of dataNotes) {
    const data = note
    const files = await getFilesByNote(note._id, user)
    data.files = files
    newNotes.push(data)
  }
  return newNotes
}

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = req.user
    const validate = await validateNote(id, user)
    if(!validate) return res.status(400).send({ error: 'Bad request' })
    const files = await getFilesByNote(id, user)
    const note = validate
    note.files = files
    return res.status(200).send({ note })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'Error server' })
  }
}

export const saveNotes = async (req: Request, res: Response) => {
  try {
    const { notes } = req.body as NoteSaveAPI
    const user = req.user
    const newNotes: any[] = []
    for await (const note of notes) {
      let bandera = false
      const { title, body, background, files, _id, categorie } = note
      let categorieValue = categorie
      if(!isValidObjectId(categorie)){
        const validate = await validateCategorie(categorie, user)
        if(validate) categorieValue = validate.categorie
        const newCategorie = new Categories({ categorie, user })
        const resp = await newCategorie.save()
        if(resp) categorieValue = resp._id.toString()
      }
      const data = { title, body, background, categorie: categorieValue, user }
      if(isValidObjectId(_id)){
        const validate = await validateNote(_id, user)
        bandera = validate ? true : false
        if(validate) {
          const newNote = await Note.findByIdAndUpdate(_id, data, { new: true })
          if(newNote) newNotes.push({ note: newNote, files })
        }
      }
      if(!bandera){
        const newNote = new Note(data)
        const respNote = await newNote.save()
        if(respNote) newNotes.push({ note: respNote, files })
      }
    }
    return res.status(200).send({ notes: newNotes })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}