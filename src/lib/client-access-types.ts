export class ClientAccessError extends Error {
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "ClientAccessError";
  }
}

export interface ClientIdentity {
  userId?: string | null;
  email?: string | null;
}

export interface ClientAccessContext {
  organizationIds: string[];
  leadProjectIds: string[];
}



