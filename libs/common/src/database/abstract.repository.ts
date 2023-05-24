import {
  Connection,
  Document,
  FilterQuery,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose'

export abstract class AbstractRepository<T extends Document, S extends Record<string, any>> {
  constructor(protected readonly AbstractModel: Model<T>, private readonly connection: Connection) {}

  async create(createDto: S, id: Types.ObjectId = new Types.ObjectId()): Promise<T> {
    const entity = new this.AbstractModel({ ...createDto, _id: id })
    return entity.save()
  }

  async find(query: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T[]> {
    return await this.AbstractModel.find(query, projection, options)
  }

  async findOne(query: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T> {
    return this.AbstractModel.findOne(query, projection, options)
  }

  async findById(id: string | Types.ObjectId, projection?: ProjectionType<T>, options?: QueryOptions<T>) {
    return this.AbstractModel.findById(new Types.ObjectId(id), projection, options)
  }

  async update(id: string | Types.ObjectId, updateDto: UpdateQuery<T>) {
    return this.AbstractModel.findByIdAndUpdate(id, updateDto, { new: true })
  }

  async updateByQuery(query: FilterQuery<T>, updateDto: UpdateQuery<T>) {
    return this.AbstractModel.findOneAndUpdate(query, updateDto, { new: true })
  }

  async startTransaction() {
    const session = await this.connection.startSession()
    session.startTransaction()
    return session
  }
}
