import { Schema, model } from 'mongoose'

const CategorySchema = new Schema({
  categorie: {
    type: String,
    required: [true, 'Categorie required'],
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'User id is required']
  },
  state: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

CategorySchema.methods.toJSON = function(){
  const { __v, user, state, ...data } = this.toObject();
  return data
}

export default model('categorie', CategorySchema)