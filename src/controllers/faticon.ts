import { Request, Response } from "express";
import { apiFaticon } from "../config/apiFaticon";
import { FaticonResponse, FaticonTokenResponse, IconsData } from "../interfaces/interfaces";
import Faticon from "../models/Faticon";

export const saveTokenFaticon = async (token: string, expires: Date) => {
  try {
    const data = { token, expires }
    const faticon = new Faticon(data)
    return await faticon.save()
  } catch (error) {
    console.log(error)
  }
}

const getTokenFaticon = async (refresh?: boolean) => {
  const body = { apikey: process.env.API_FATICON }
  const { data } = await apiFaticon.post<FaticonTokenResponse>('app/authentication', body)
  const { token, expires } = data.data
  const tokenExpires = new Date(expires * 1000)
  return refresh ? { token, expires: tokenExpires } : await saveTokenFaticon(token, tokenExpires)
}

const getTokenDb = async () : Promise<any | undefined> => {
  const token = await Faticon.find({})
  if(token.length === 0) {
    return await getTokenFaticon()
  }
  return token[0]
}

const updateToken = async (id: string) => {
  const resp : any = await getTokenFaticon(true)
  if(!resp) return
  const { token, expires } = resp
  return await Faticon.findByIdAndUpdate(id, { token, expires }, { new: true })
}

const validateToken = async (expires: any, id: string, token: string) => {
  const newDate = new Date()
  if(expires <= newDate) return await updateToken(id)
  return token
}

export const getIconFaticon = async (req: Request, res: Response) => {
  const token = await getTokenDb()
  const resp : any = await validateToken(token.expires, token._id, token.token)
  const { search } = req.params
  const idPack = process.env.ID_PACK
  const url = `search/icons?q=doc&limit=10&packId=${idPack}&limit=50`
  const headers = { headers: { 'Authorization': `Bearer ${resp}` }}
  const { data } = await apiFaticon.get<FaticonResponse>(url, headers)
  const icon = searchIcon(search, data.data)
  return res.status(200).send({ icons: icon })
}

const searchIcon = (search: string, data: IconsData[]) : string => {
  let icon = data[0].images[512]
  let bandera = false
  data.forEach((item) => {
    if(bandera) return
    const { description, images } = item
    if(description.toLowerCase() === search.toLowerCase()) {
      bandera = true
      icon = images[512]
    }
  })
  return icon
}

 