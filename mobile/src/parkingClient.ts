import type { ApiOptions } from './api';

export type Row = { flatNumber: string; slotNumber: string; vehicleNumber?: string; notes?: string };
export type Exclusion = { flatNumber: string; reason: string };
export type Issue = { row: number | null; field: string; code: string; message: string };
type Capacity = { total: number; occupied: number; available: number };
export type Coverage = {
  totalEligibleFlats: number; totalAssignedFlats: number; unassignedEligibleFlats: string[];
  excludedFlats: Exclusion[]; assignedVehicles: { flatNumber: string; vehicleNumber: string }[];
  unresolvedReferences: Issue[]; capacity: { INSIDE: Capacity; OUTSIDE: Capacity };
};
export type DraftResponse = {
  draft: { _id: string; cycleId: string; revision: number; status: 'DRAFT' | 'VALIDATED' | 'APPROVED' | 'PUBLISHED' | 'CANCELLED'; issues?: Issue[] };
  version?: { revision: number; rows: (Row & { row: number })[]; exclusions: Exclusion[]; importIssues: Issue[] };
  issues?: Issue[];
  coverage?: Coverage;
};
export function applyDraftReview(current: DraftResponse, review: DraftResponse): DraftResponse {
  if (current.draft._id !== review.draft._id || current.draft.revision !== review.draft.revision) return review;
  return { ...review, version: review.version ?? current.version };
}
export type Allocation = {
  cycle: { id: string; name: string; startDate: string; endDate: string };
  publication?: { id: string } | null;
  parking: { type: 'INSIDE' | 'OUTSIDE'; slot: string | null; physicalSlot?: string; position?: 'FULL' | 'A' | 'B' | 'SINGLE' };
  vehicle: { id: string | null; number: string | null };
};
export type ColumnMapping = Partial<Record<keyof Row, number>>;
export type InputFile = { filename: string; mime: 'text/csv' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; bytes: Blob | Uint8Array<ArrayBuffer> };
type Request = <T>(path: string, options?: ApiOptions) => Promise<T>;
type Schedule = { _id: string; dueAt: string; status: 'PENDING' | 'RETRY' | 'ACTIVATED' | 'CANCELLED' | 'FAILED' | 'SUPERSEDED' };

export const parkingKeys = {
  resident: (account: string) => ['resident-parking', account] as const,
  administration: (account: string) => ['allocation-admin', account] as const,
};

const segment = encodeURIComponent;

export function createParkingClient(request: Request) {
  const drafts = '/allocation-drafts';
  const base = (id: string) => drafts + '/' + segment(id);
  const mutate = <T>(path: string, body: Record<string, unknown>, method: ApiOptions['method'] = 'POST', headers?: Record<string, string>) =>
    request<T>(path, { body, method, headers });
  const fileOptions = (file: InputFile, mapping?: ColumnMapping): ApiOptions => ({
    method: 'POST', raw: file.bytes, headers: {
      'Content-Type': file.mime, 'X-ParkFair-Filename': file.filename,
      ...(mapping && { 'X-ParkFair-Columns': JSON.stringify(mapping) }),
    },
  });
  return {
    createCycle: (data: { cycleName: string; startDate: string; endDate: string; durationDays: number }) =>
      mutate<{ data: { _id: string; cycleName: string; status: string } }>('/cycles', data),
    createDraft: (cycleId: string, initial?: { rows?: Row[]; copyAssignments?: boolean; exclusions?: Exclusion[] }) =>
      mutate<DraftResponse>(drafts, { cycleId, ...initial }),
    getDraft: (id: string) => request<DraftResponse>(base(id)),
    editDraft: (id: string, revision: number, rows: Row[], exclusions?: Exclusion[]) =>
      mutate<DraftResponse>(base(id), { revision, rows, ...(exclusions && { exclusions }) }, 'PUT'),
    previewImport: (id: string, file: InputFile, mapping?: ColumnMapping) =>
      request<{ columns: { column: number; label: string; recognized: keyof Row | null; mapped: keyof Row | null }[];
        importIssues: Issue[]; dataRows: number }>(base(id) + '/import-preview', fileOptions(file, mapping)),
    upload: (id: string, revision: number, file: InputFile, mapping?: ColumnMapping) => {
      const options = fileOptions(file, mapping);
      return request<DraftResponse>(base(id) + '/import', { ...options, headers: { ...options.headers, 'If-Match': `"${revision}"` } });
    },
    validate: (id: string, revision: number) => mutate<DraftResponse>(base(id) + '/validate', { revision }),
    coverage: (id: string) => request<{ revision: number; coverage: Coverage; issues: Issue[] }>(base(id) + '/coverage'),
    compare: (id: string, from: number, to: number) =>
      request<{ changes: { row: number; previous: Row | null; current: Row | null }[] }>(
        base(id) + '/compare?' + new URLSearchParams({ from: String(from), to: String(to) })),
    approve: (id: string, revision: number) => mutate<DraftResponse>(base(id) + '/approve', { revision }),
    publish: (id: string, revision: number, key: string) =>
      mutate<{ publication: { _id: string; cycleId: string; sequence: number }; replayed: boolean }>(
        base(id) + '/publish', { revision }, 'POST', { 'Idempotency-Key': key }),
    activate: (cycleId: string, publicationId: string) => mutate('/cycles/' + segment(cycleId) + '/status',
      { status: 'ACTIVE', publicationId }, 'PUT'),
    scheduleActivation: (cycleId: string, publicationId: string, approved: true) =>
      mutate<{ schedule: Schedule }>('/cycles/' + segment(cycleId) + '/activation-schedules', { publicationId, approved }),
    schedules: (cycleId: string) => request<{ schedules: Schedule[] }>('/cycles/' + segment(cycleId) + '/activation-schedules'),
    cancelSchedule: (cycleId: string, jobId: string) => request<{ schedule: Schedule }>(
      '/cycles/' + segment(cycleId) + '/activation-schedules/' + segment(jobId), { method: 'DELETE' }),
    schedule: (signal?: AbortSignal) =>
      request<{ current: Allocation | null; next: Allocation | null; upcoming: Allocation[] }>('/resident/schedule', { signal }),
    history: (signal?: AbortSignal) => request<{ history: Allocation[] }>('/resident/history', { signal }),
    listSessions: () => request<{ sessions: { _id: string; client: 'web' | 'native'; expiresAt: string }[] }>('/auth/sessions'),
    revokeSession: (sessionId: string) => request('/auth/sessions/' + segment(sessionId), { method: 'DELETE' }),
  };
}
