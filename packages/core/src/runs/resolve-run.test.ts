import { readFileSync } from "node:fs";

import { assessmentSchema } from "@loopz/contracts/assessment";
import { runSchema } from "@loopz/contracts/run";
import { confirmedContractVersionSchema } from "@loopz/contracts/versioning";
import { describe, expect, it } from "vitest";

import { determineRunNextStep, resolveRun } from "./resolve-run";

function fixtures(outcome: "completed_with_evidence"|"repair_recommended"|"unverifiable_more_evidence_required"|"blocked_human_input_required"|"unsafe_or_out_of_scope"="completed_with_evidence", repairAttempts=0) {
  const loopSpec=JSON.parse(readFileSync(new URL("../../../../tests/fixtures/loopspec/valid-small-web-project.json",import.meta.url),"utf8"));
  const hash=`sha256:${"a".repeat(64)}`;
  const version=confirmedContractVersionSchema.parse({schemaVersion:"0.2",versionId:"22222222-2222-4222-8222-222222222222",projectId:"11111111-1111-4111-8111-111111111111",version:1,confirmedAt:"2026-09-02T10:00:00.000Z",confirmedBy:"user",contractHash:hash,approvals:[],loopSpec});
  const run=runSchema.parse({schemaVersion:"0.2",runId:"33333333-3333-4333-8333-333333333333",projectId:version.projectId,loopSpecVersion:"0.2",contractVersionId:version.versionId,contractVersion:1,contractHash:hash,generatedAt:"2026-09-02T11:00:00.000Z",selectedOutputFormat:"codex",state:"assessed",repairAttempts,createdAt:"2026-09-02T11:00:00.000Z",updatedAt:"2026-09-02T12:00:00.000Z"});
  const status=outcome==="completed_with_evidence"?"verified_by_submitted_evidence":outcome==="repair_recommended"?"failed":outcome==="blocked_human_input_required"?"blocked":"unverifiable";
  const assessment=assessmentSchema.parse({schemaVersion:"0.2",assessmentId:"44444444-4444-4444-8444-444444444444",assessmentVersion:1,previousAssessmentId:null,runId:run.runId,contractVersionId:version.versionId,contractHash:hash,evidenceSubmissionId:"55555555-5555-4555-8555-555555555555",outcome,criteria:version.loopSpec.acceptance.criteria.map((item)=>({criterionId:item.id,claim:status==="verified_by_submitted_evidence"?"passed":status==="failed"?"failed":status==="blocked"?"blocked":"unverified",priority:item.priority,status,evidenceReferences:[],evidenceStrength:"none",missingRequiredEvidence:[],contradictions:[],explanation:"Assessment result",confidence:.9})),contradictions:[],risks:[],recommendedNextAction:"Next",corrections:[],assessedAt:"2026-09-02T12:00:00.000Z"});
  return {run,version,assessment};
}

describe("run resolution",()=>{
  it("routes each assessment to one supported next step",()=>{
    const complete = fixtures("completed_with_evidence");
    expect(determineRunNextStep(complete.run, complete.version, complete.assessment)).toBe("complete");
    const repair=fixtures("repair_recommended");expect(determineRunNextStep(repair.run,repair.version,repair.assessment)).toBe("repair");
    const evidence=fixtures("unverifiable_more_evidence_required");expect(determineRunNextStep(evidence.run,evidence.version,evidence.assessment)).toBe("more_evidence");
    const blocked=fixtures("blocked_human_input_required");expect(determineRunNextStep(blocked.run,blocked.version,blocked.assessment)).toBe("block");
    const limit=fixtures("repair_recommended",2);expect(determineRunNextStep(limit.run,limit.version,limit.assessment)).toBe("block");
  });

  it("creates immutable completion and blocked-resolution records",()=>{
    const complete=fixtures();
    const done=resolveRun({...complete,resolutionId:"66666666-6666-4666-8666-666666666666",resolvedAt:"2026-09-02T12:05:00.000Z"});
    expect(done.run.state).toBe("completed");expect(done.resolution.reason).toBe("completion_supported");
    const unsafe=fixtures("unsafe_or_out_of_scope");
    const stopped=resolveRun({...unsafe,resolutionId:"66666666-6666-4666-8666-666666666666",resolvedAt:"2026-09-02T12:05:00.000Z"});
    expect(stopped.run.state).toBe("blocked");expect(stopped.resolution.reason).toBe("unsafe_or_out_of_scope");
  });

  it("does not terminate a run while repair or evidence return remains",()=>{
    const repair=fixtures("repair_recommended");
    expect(()=>resolveRun({...repair,resolutionId:"66666666-6666-4666-8666-666666666666",resolvedAt:"2026-09-02T12:05:00.000Z"})).toThrow("non-terminal");
  });
});
