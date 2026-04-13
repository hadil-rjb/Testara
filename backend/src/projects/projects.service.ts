import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectDocument> {
    const project = new this.projectModel({
      ...createProjectDto,
      owner: userId,
      members: [userId],
    });
    return project.save();
  }

  async findAllByUser(userId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ $or: [{ owner: userId }, { members: userId }] })
      .populate('owner', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).populate('owner', 'firstName lastName avatar');
    if (!project) throw new NotFoundException('Projet non trouvé');
    return project;
  }

  async delete(id: string, userId: string): Promise<void> {
    const project = await this.projectModel.findOneAndDelete({ _id: id, owner: userId });
    if (!project) throw new NotFoundException('Projet non trouvé');
  }
}
