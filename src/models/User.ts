import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Password is required']
  },
  profile_image: {
    type: String,
    trim: true,
    default: ''
  },
  refFile: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: Boolean,
    default: true
  },
  emailValidate: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

UserSchema.index({ email: "text" });

UserSchema.methods.toJSON = function () {
  const { __v, createdAt, updatedAt, password, state, emailValidate, refFile, ...data } = this.toObject();
  return data;
};

export default model('user', UserSchema)