import { repairTaskSchema } from "@loopz/contracts/repair";
import { runSchema } from "@loopz/contracts/run";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runStorageKey, taskRunStorageKey } from "../artifacts/task-storage";
import {
  beginRepairEvidenceReturn,
  loadRepairTasks,
  markRepairDelivered,
  persistRepairTask,
  repairStorageKey,
  validateRepairHistoryForRun,
} from "./repair-storage";

const run = runSchema.parse({
  schemaVersion:"0.2",runId:"33333333-3333-4333-8333-333333333333",projectId:"11111111-1111-4111-8111-111111111111",
  loopSpecVersion:"0.2",contractVersionId:"22222222-2222-4222-8222-222222222222",contractVersion:1,
  contractHash:`sha256:${"a".repeat(64)}`,generatedAt:"2026-09-02T10:00:00.000Z",selectedOutputFormat:"codex",
  state:"assessed",repairAttempts:0,createdAt:"2026-09-02T10:00:00.000Z",updatedAt:"2026-09-02T12:00:00.000Z",
});

function repair(attempt=1,id="55555555-5555-4555-8555-555555555555") {
  return repairTaskSchema.parse({
    schemaVersion:"0.2",repairId:id,parentRunId:run.runId,parentAssessmentId:"44444444-4444-4444-8444-444444444444",
    parentEvidenceSubmissionId:"66666666-6666-4666-8666-666666666666",contractVersionId:run.contractVersionId,
    contractHash:run.contractHash,attempt,unresolvedCriteria:[{criterionId:"AC-001",status:"failed",requirement:"Form works",
      explanation:"Test failed",missingRequiredEvidence:[],evidenceIds:["EV-001"]}],preservedCriterionIds:["AC-002"],
    failureEvidenceIds:["EV-001"],sourceEvidenceFingerprint:`sha256:${(attempt===1?"b":"c").repeat(64)}`,
    instructions:"Repair AC-001 only.",requiredRegressionChecks:["npm test"],stopWhen:["Failure repeats"],
    generatedAt:`2026-09-02T12:${attempt===1?"05":"15"}:00.000Z`,
  });
}

describe("repair persistence and return",()=>{
  const values=new Map<string,string>();
  beforeEach(()=>vi.stubGlobal("localStorage",{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)}));
  afterEach(()=>{values.clear();vi.unstubAllGlobals()});

  it("appends a repair, increments the attempt, and advances the run",()=>{
    const saved=persistRepairTask(run,repair());
    expect(saved.run).toMatchObject({state:"repair_generated",repairAttempts:1});
    expect(loadRepairTasks(run.runId)).toEqual([repair()]);
    expect(JSON.parse(values.get(runStorageKey(run.runId))!).repairAttempts).toBe(1);
  });

  it("requires delivery before starting fresh evidence return",()=>{
    const saved=persistRepairTask(run,repair());
    expect(()=>beginRepairEvidenceReturn(saved.run,repair(),"2026-09-02T12:10:00.000Z")).toThrow("Copy or download");
    markRepairDelivered(repair(),"2026-09-02T12:09:00.000Z");
    const awaiting=beginRepairEvidenceReturn(saved.run,repair(),"2026-09-02T12:10:00.000Z");
    expect(awaiting.state).toBe("awaiting_evidence");
    expect(beginRepairEvidenceReturn(awaiting,repair(),"2026-09-02T12:11:00.000Z")).toEqual(awaiting);
  });

  it("rejects mismatched histories, duplicate attempts, and repairs above the limit",()=>{
    expect(()=>validateRepairHistoryForRun({...run,repairAttempts:1},[])).toThrow("attempt count");
    values.set(repairStorageKey(run.runId),JSON.stringify([repair(),repair()]));
    expect(()=>loadRepairTasks(run.runId)).toThrow();
    values.set(repairStorageKey(run.runId),JSON.stringify([repair(),repair(2,"77777777-7777-4777-8777-777777777777")]));
    expect(()=>persistRepairTask({...run,state:"assessed",repairAttempts:2},repair(2))).toThrow("limit");
  });

  it("rolls repair history and run pointers back when persistence fails",()=>{
    const contractKey=taskRunStorageKey(run.projectId,run.contractVersionId),indexKey=runStorageKey(run.runId);
    values.set(contractKey,JSON.stringify(run));values.set(indexKey,JSON.stringify(run));let fail=true;
    vi.stubGlobal("localStorage",{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{if(key===indexKey&&fail&&JSON.parse(value).state==="repair_generated"){fail=false;throw new Error("Quota exceeded")}values.set(key,value)},removeItem:(key:string)=>values.delete(key)});
    expect(()=>persistRepairTask(run,repair())).toThrow("Quota exceeded");
    expect(values.get(repairStorageKey(run.runId))).toBeUndefined();
    expect(JSON.parse(values.get(contractKey)!)).toEqual(run);
    expect(JSON.parse(values.get(indexKey)!)).toEqual(run);
  });
});
