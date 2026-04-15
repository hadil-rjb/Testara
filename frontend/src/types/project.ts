export type ProjectStatus =
  | 'Crawl'
  | 'Ready'
  | 'Running'
  | 'Passed'
  | 'Failed'
  | string;

export type ProjectEnvironment = 'Dev' | 'Staging' | 'Prod' | string;

export interface ProjectOwner {
  _id?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface Project {
  _id: string;
  name: string;
  url: string;
  status?: ProjectStatus;
  environment?: ProjectEnvironment;
  passed?: number;
  failed?: number;
  totalScenarios?: number;
  duration?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: ProjectOwner;
}
