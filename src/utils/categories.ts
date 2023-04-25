import Categories from "../models/Categories"

export const validateCategorie = async (categorie: string, user: string, id?: string) => {
  try {
    const query = { categorie: categorie.toLowerCase(), user }
    return id ? await Categories.findById(id) : await Categories.findOne(query)
  } catch (error) {
    console.log(error)
  }
}