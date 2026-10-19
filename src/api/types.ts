export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type StateInstance =
  'notAuthorized' | 'authorized' | 'blocked' | 'suspended' | 'starting' | 'pendingPassword';

export interface GetStateInstanceResponse {
  stateInstance: StateInstance;
}
