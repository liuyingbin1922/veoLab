import { KidsEnglishPlan } from "@/packages/core/src/kidsEnglish/generatePlan";

type KidsEnglishJobStatus = "queued" | "generating" | "ready" | "failed";

export type KidsEnglishJob = {
  id: string;
  type: "word" | "grammar";
  key: string;
  grade: string;
  resolution: 720 | 1080;
  status: KidsEnglishJobStatus;
  storyboard: KidsEnglishPlan["storyboard"];
  veo_segments: KidsEnglishPlan["veo_segments"];
  meta: KidsEnglishPlan["meta"];
  createdAt: string;
  updatedAt: string;
  output?: {
    videoUrl?: string;
    cover?: string;
  };
};

type JobStore = {
  jobs: Map<string, KidsEnglishJob>;
};

const globalJobStore = globalThis as unknown as { __kidsEnglishJobs__?: JobStore };

const store: JobStore = (globalJobStore.__kidsEnglishJobs__ ||= { jobs: new Map() });

export function createKidsEnglishJob(params: {
  type: "word" | "grammar";
  key: string;
  grade: string;
  resolution: 720 | 1080;
  plan: KidsEnglishPlan;
}): KidsEnglishJob {
  const now = new Date().toISOString();
  const existingVideo = params.plan.meta.seo.video;
  const job: KidsEnglishJob = {
    id: `kids-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: params.type,
    key: params.key,
    grade: params.grade,
    resolution: params.resolution,
    status: existingVideo ? "ready" : "generating",
    storyboard: params.plan.storyboard,
    veo_segments: params.plan.veo_segments,
    meta: params.plan.meta,
    createdAt: now,
    updatedAt: now,
    output: existingVideo
      ? {
          videoUrl: existingVideo.src,
          cover: existingVideo.poster,
        }
      : undefined,
  };
  store.jobs.set(job.id, job);
  return job;
}

export function updateKidsEnglishJob(jobId: string, updates: Partial<KidsEnglishJob>) {
  const job = store.jobs.get(jobId);
  if (!job) return null;
  const next = { ...job, ...updates, updatedAt: new Date().toISOString() } satisfies KidsEnglishJob;
  store.jobs.set(jobId, next);
  return next;
}

export function getKidsEnglishJob(jobId: string) {
  return store.jobs.get(jobId) ?? null;
}

export function listKidsEnglishJobs() {
  return Array.from(store.jobs.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
