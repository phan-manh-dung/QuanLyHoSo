import mongoose, { Schema, Document } from 'mongoose';

export interface IRowData extends Document {
  values: Map<string, string | number | null | Date>; // Xác định các kiểu có thể
  createdAt: Date;
  updatedAt: Date;
}

const RowDataSchema: Schema = new Schema(
  {
    values: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const RowData =
  mongoose.models.RowData || mongoose.model<IRowData>('RowData', RowDataSchema);

export default RowData;
