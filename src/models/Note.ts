import { Schema, model } from 'mongoose'

const NoteSchema = new Schema({
  title: {
    type: String,
    trim: true,
    default: ''
  },
  body: {
    type: String,
    trim: true,
    default: ''
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'User id is required']
  },
  state: {
    type: Boolean,
    default: true
  },
  background: {
    type: String,
    default: ""
  },
  files: {
    type: Schema.Types.Mixed,
    filesData: Schema.Types.Mixed,
    default: { filesData: [], mediaData: [] }
  },
  categorie: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    required: [true, 'Categorie required']
  }
},  { timestamps: true })

NoteSchema.index({ title: 'text', body: 'text' })

NoteSchema.methods.toJSON = function(){
  const { __v, user, state, ...data } = this.toObject();
  return data
}

export default model('note', NoteSchema)