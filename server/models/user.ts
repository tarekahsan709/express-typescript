import * as bcrypt from "bcryptjs";
import { Document, Error, model, Model, Schema } from "mongoose";

type comparePasswordFunction = (
  candidatePassword: string,
  cb: (err: any, isMatch: any) => {}
) => void;

type generateHash = (password: string) => string;

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  comparePassword: comparePasswordFunction;
  generateHash: generateHash;
}

export const userSchema: Schema = new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
})
  .set("autoIndex", true)
  .set("minimize", false)
  .set("timestamps", true);

userSchema.methods.comparePassword = function(
  candidatePassword: string,
  callback: any
) {
  bcrypt.compare(
    candidatePassword,
    this.password,
    (err: Error, isMatch: boolean) => {
      callback(err, isMatch);
    }
  );
};

userSchema.methods.generateHash = (password): string => {
  return bcrypt.hashSync(password, 10);
};

export const User: Model<IUser> = model<IUser>("User", userSchema);
