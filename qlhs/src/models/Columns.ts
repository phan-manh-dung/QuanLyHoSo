import mongoose, { Schema, Document, Model } from "mongoose";

export interface IColumn extends Document {
  id: string;
  label: string;
  type: Schema.Types.Mixed;
}

const columnSchema = new Schema<IColumn>({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  type: { type: Schema.Types.Mixed, default: "string" }, 
});

const Column: Model<IColumn> = mongoose.models.Column || mongoose.model<IColumn>("Column", columnSchema);

export default Column;
