import { Request, Response } from 'express'
import { validateCategorie } from '../utils/categories'
import Categories from '../models/Categories'

export const getCategories = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const categories = await Categories.find({ user, state: true })
    if(categories.length === 0){
      const newCategory = new Categories({ categorie: 'note', user })
      const resp = await newCategory.save()
      if(!resp) return res.status(500).send({ error: 'Error save categorie note' })
      return res.status(200).send({ categories: [resp] })
    }
    return res.status(200).send({ categories })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}


export const saveCategorie = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { categorie } = req.body
    const validate = await validateCategorie(categorie, user)
    if(validate) return res.status(404).send({ error: 'Categorie already exists' })
    const newCategorie = new Categories({ categorie, user })
    await newCategorie.save()
    return res.status(200).send({ categorie: newCategorie })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}

export const updateCategorie = async (req: Request, res: Response, update?: boolean) => {
  try {
    const user = req.user
    const { id } = req.params
    const validateById = await validateCategorie('', user, id)
    if(!validateById) return res.status(404).send({ error: 'Categorie do not exists by id' })
    if(validateById.user.toString() !== user) return res.status(404).send({ error: 'User do not have permissions' })
    const data = update ? { categorie: req.body.categorie } : { state: false }
    const newCategorie = await Categories.findByIdAndUpdate(id, data, { new: true })
    const resp = update ? { categorie: newCategorie } : { msg: 'Categorie deleted' }
    return res.status(200).send(resp)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: 'Error server' })
  }
}