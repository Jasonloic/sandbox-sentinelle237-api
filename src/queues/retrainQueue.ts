import { Queue } from "bullmq";

const { REDIS_HOST, REDIS_PORT } = process.env as { [key: string]: string };
const connection = { host: REDIS_HOST || "127.0.0.1", port: Number(REDIS_PORT) || 6379 };

export const retrainQueue = new Queue("retrain-classification", { connection });

export async function enqueueRetrain(reason: string) {
    await retrainQueue.add(
        "retrain",
        { reason, triggeredAt: new Date().toISOString() },
        { removeOnComplete: true, removeOnFail: 50 }
    );
}