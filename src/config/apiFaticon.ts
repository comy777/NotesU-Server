import axios from "axios"

const baseURL = process.env.URL_FATICON

export const apiFaticon = axios.create({ baseURL })