import { Schema, model } from 'mongoose'

const FilesSchema = new Schema({
  file_name: {
    type: String,
    trim: true,
    required: [true, 'File name is required']
  },
  ref: {
    type: String,
    trim: true,
    required: [true, 'Storage ref is required']
  },
  url: {
    type: String,
    trim: true,
    required: [true, 'Url is required']
  },
  state: {
    type: Boolean,
    default: true
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "note",
    required: [true, 'Note id is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: [true, 'Usaer id is required']
  },
  typeFile: {
    type: String,
    required: [true, 'The file type is required']
  },
  icon: {
    type: String,
    default: ''
  }
},  { timestamps: true })

FilesSchema.index({ file_name: 'text' })

FilesSchema.methods.toJSON = function(){
  const { __v, user, state, ref, ...data } = this.toObject();
  return data
}

export default model('files', FilesSchema)