export type YardPlanStreamHandlers = {
  onText: (text: string) => void;
  onStatus?: (status: string) => void;
};

function parseEvent(block: string, handlers: YardPlanStreamHandlers) {
  const data = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
  if (!data || data === "[DONE]") return;

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(data) as Record<string, unknown>;
  } catch {
    return;
  }

  const type = typeof event["type"] === "string" ? event["type"] : "";
  if (type === "response.output_text.delta" && typeof event["delta"] === "string") {
    handlers.onText(event["delta"]);
  } else if (type === "response.reasoning_summary_text.delta") {
    handlers.onStatus?.("Reviewing the yard and shaping recommendations…");
  } else if (type === "response.completed") {
    handlers.onStatus?.("Project brief ready");
  } else if (type === "error") {
    const error = event["error"] as { message?: unknown } | undefined;
    throw new Error(typeof error?.message === "string" ? error.message : "The yard planner could not finish this brief.");
  }
}

export async function streamYardPlan(form: FormData, handlers: YardPlanStreamHandlers) {
  const response = await fetch("/api/yard-plan", { method: "POST", body: form });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: unknown } | null;
    throw new Error(typeof payload?.message === "string" ? payload.message : "The yard planner is unavailable right now.");
  }
  if (!response.body) throw new Error("The yard planner returned an empty response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) parseEvent(block, handlers);
    if (done) break;
  }
  if (buffer.trim()) parseEvent(buffer, handlers);
}