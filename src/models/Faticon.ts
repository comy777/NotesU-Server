import { Schema, model } from 'mongoose'

const FaticonSchema = new Schema({
  token: {
    type: String,
    trim: true,
    required: [true, 'Token required']
  },
  expires: {
    type: Date,
    trim: true,
    required: [true, 'Password is required']
  }
}, { timestamps: true })

FaticonSchema.methods.toJSON = function () {
  const { __v, created, ...data } = this.toObject();
  return data;
};

export default model('faticon_api', FaticonSchema)