import mongoose, { Schema, Document } from 'mongoose';

export interface IRowData extends Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Map<string, any>; // Map key là columnId, value là dữ liệu bất kỳ
  createdAt: Date;
  updatedAt: Date;
}

const RowDataSchema: Schema = new Schema(
  {
    values: {
      type: Map,
      of: Schema.Types.Mixed,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      default: new Map<string, any>(),
    },
  },
  { timestamps: true }
);

const RowData =
  mongoose.models.RowData || mongoose.model<IRowData>('RowData', RowDataSchema);

export default RowData;
